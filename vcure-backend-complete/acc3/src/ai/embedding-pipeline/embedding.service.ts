import { Injectable, Inject } from '@nestjs/common';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { chunkText } from './chunker';
import { VectorStoreProvider } from '../vector-search/vector-store.interface';
import { AIProviderFactory } from '../providers/provider.factory';
import { AIEnv } from '../config/ai.config';
import { AIError } from '../errors/ai.errors';
import { AI_ENV, PRIMARY_VECTOR_STORE } from '../ai.tokens';

/**
 * EMBEDDING PIPELINE — Service
 *
 * Input Schema:  { knowledgeArticleId: string }
 * Output Schema: { chunksCreated: number, embeddingIds: string[] }
 *
 * Flow: KnowledgeArticle.content -> chunker -> provider.embed() -> persist
 * `Embedding` rows (Postgres, for traceability/joins) AND upsert into the
 * external vector store (for similarity search). Both writes happen for
 * every chunk; if the vector store write fails, the pipeline still leaves a
 * correct Postgres record and reports the partial failure rather than
 * silently losing track of the chunk (Error Handling requirement).
 */
export const EmbedArticleInputSchema = z.object({
  knowledgeArticleId: z.string().uuid(),
});
export type EmbedArticleInput = z.infer<typeof EmbedArticleInputSchema>;

export interface EmbedArticleOutput {
  chunksCreated: number;
  embeddingIds: string[];
  vectorStoreFailures: number;
}

@Injectable()
export class EmbeddingPipelineService {
  constructor(
    private readonly prisma: PrismaClient,
    @Inject(PRIMARY_VECTOR_STORE) private readonly vectorStore: VectorStoreProvider,
    private readonly providerFactory: AIProviderFactory,
    @Inject(AI_ENV) private readonly env: AIEnv,
  ) {}

  async embedArticle(input: EmbedArticleInput): Promise<EmbedArticleOutput> {
    const parsed = EmbedArticleInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new AIError('INPUT_VALIDATION_FAILED', 'Invalid embed-article input', {
        internalDetail: JSON.stringify(parsed.error.issues),
      });
    }

    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id: parsed.data.knowledgeArticleId },
    });
    if (!article) {
      throw new AIError('EMBEDDING_FAILED', `KnowledgeArticle ${parsed.data.knowledgeArticleId} not found`);
    }

    // Remove any prior embeddings for this article so re-embedding after a
    // content edit doesn't leave stale chunks searchable.
    const existing = await this.prisma.embedding.findMany({ where: { knowledgeArticleId: article.id } });
    if (existing.length > 0) {
      await this.vectorStore.delete(existing.map((e) => e.vectorStoreId)).catch(() => undefined);
      await this.prisma.embedding.deleteMany({ where: { knowledgeArticleId: article.id } });
    }

    const chunks = chunkText(article.content, this.env.EMBEDDING_CHUNK_SIZE_TOKENS, this.env.EMBEDDING_CHUNK_OVERLAP_TOKENS);
    if (chunks.length === 0) {
      throw new AIError('EMBEDDING_FAILED', `KnowledgeArticle ${article.id} produced zero chunks (empty content?)`);
    }

    const { provider, modelName } = await this.providerFactory.resolveForPurpose('embedding');
    const embeddingResponse = await provider.embed({
      input: chunks.map((c) => c.text),
      model: modelName,
      requestId: crypto.randomUUID(),
    });

    if (embeddingResponse.vectors.length !== chunks.length) {
      throw new AIError('EMBEDDING_FAILED', 'Embedding provider returned a vector count that does not match chunk count');
    }

    const embeddingIds: string[] = [];
    let vectorStoreFailures = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const vector = embeddingResponse.vectors[i];
      const vectorStoreId = `${article.id}:${chunk.index}`;

      const embedding = await this.prisma.embedding.create({
        data: {
          knowledgeArticleId: article.id,
          vectorStoreId,
          model: embeddingResponse.model,
          dimensions: embeddingResponse.dimensions,
          chunkIndex: chunk.index,
          chunkText: chunk.text,
        },
      });
      embeddingIds.push(embedding.id);

      try {
        await this.vectorStore.upsert([
          {
            id: vectorStoreId,
            vector,
            metadata: { knowledgeArticleId: article.id, chunkIndex: chunk.index, chunkText: chunk.text },
          },
        ]);
      } catch {
        vectorStoreFailures += 1;
      }
    }

    return { chunksCreated: chunks.length, embeddingIds, vectorStoreFailures };
  }
}

import { Injectable, Inject } from '@nestjs/common';
import { z } from 'zod';
import { VectorStoreProvider } from './vector-store.interface';
import { AIProviderFactory } from '../providers/provider.factory';
import { AIEnv } from '../config/ai.config';
import { AIError } from '../errors/ai.errors';
import { AI_ENV, PRIMARY_VECTOR_STORE, FALLBACK_VECTOR_STORE } from '../ai.tokens';

/**
 * VECTOR SEARCH LAYER — Service
 *
 * Input Schema:  { query: string, topK?: number, minScore?: number }
 * Output Schema: { matches: { knowledgeArticleId, chunkText, chunkIndex, score }[] }
 *
 * This is the retrieval half of RAG. The generation half (feeding matches
 * into a prompt) is the caller's responsibility (e.g. ChatService,
 * RecommendationEngine) — kept separate so retrieval can be unit tested and
 * reused independent of any specific prompt template.
 */
export const VectorSearchInputSchema = z.object({
  query: z.string().min(1),
  topK: z.number().int().positive().optional(),
  minScore: z.number().min(0).max(1).optional(),
});
export type VectorSearchInput = z.infer<typeof VectorSearchInputSchema>;

export interface VectorSearchMatch {
  knowledgeArticleId: string;
  chunkIndex: number;
  chunkText: string;
  score: number;
}

export interface VectorSearchOutput {
  matches: VectorSearchMatch[];
  usedFallback: boolean;
}

@Injectable()
export class VectorSearchService {
  constructor(
    @Inject(PRIMARY_VECTOR_STORE) private readonly vectorStore: VectorStoreProvider,
    @Inject(FALLBACK_VECTOR_STORE) private readonly fallbackVectorStore: VectorStoreProvider,
    private readonly providerFactory: AIProviderFactory,
    @Inject(AI_ENV) private readonly env: AIEnv,
  ) {}

  async search(input: VectorSearchInput): Promise<VectorSearchOutput> {
    const parsed = VectorSearchInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new AIError('INPUT_VALIDATION_FAILED', 'Invalid vector search input', {
        internalDetail: JSON.stringify(parsed.error.issues),
      });
    }
    const { query, topK = this.env.VECTOR_SEARCH_TOP_K, minScore = this.env.VECTOR_SEARCH_MIN_SCORE } = parsed.data;

    const { provider, modelName } = await this.providerFactory.resolveForPurpose('embedding');
    const embedded = await provider.embed({
      input: [query],
      model: modelName,
      requestId: crypto.randomUUID(),
    });
    const queryVector = embedded.vectors[0];

    let usedFallback = false;
    let matches;
    try {
      const healthy = await this.vectorStore.healthCheck();
      if (!healthy) throw new AIError('VECTOR_SEARCH_FAILED', 'Primary vector store failed health check');
      matches = await this.vectorStore.query(queryVector, topK, minScore);
    } catch {
      usedFallback = true;
      matches = await this.fallbackVectorStore.query(queryVector, topK, minScore);
    }

    return {
      matches: matches.map((m) => ({
        knowledgeArticleId: m.metadata.knowledgeArticleId,
        chunkIndex: m.metadata.chunkIndex,
        chunkText: m.metadata.chunkText,
        score: m.score,
      })),
      usedFallback,
    };
  }
}

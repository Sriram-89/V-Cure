import { Injectable, Inject } from '@nestjs/common';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { VectorSearchService } from '../vector-search/vector-search.service';
import { EmbeddingPipelineService } from '../embedding-pipeline/embedding.service';
import { VectorStoreProvider } from '../vector-search/vector-store.interface';
import { AIError } from '../errors/ai.errors';
import { PRIMARY_VECTOR_STORE } from '../ai.tokens';

/**
 * KNOWLEDGE BASE — Service
 *
 * Owns lifecycle of `KnowledgeArticle` rows and is the single place that
 * triggers (re-)embedding when content changes, so RAG never silently drifts
 * out of sync with the source-of-truth article text.
 */
export const CreateKnowledgeArticleSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().min(1),
  sourceType: z.enum(['medical_guideline', 'nutrition_science', 'internal_policy']),
  sourceRef: z.string().optional(),
});
export type CreateKnowledgeArticleInput = z.infer<typeof CreateKnowledgeArticleSchema>;

export const RetrieveContextInputSchema = z.object({
  query: z.string().min(1),
  topK: z.number().int().positive().optional(),
});
export type RetrieveContextInput = z.infer<typeof RetrieveContextInputSchema>;

export interface RetrieveContextOutput {
  contextText: string; // pre-joined, ready to interpolate into a prompt's {{knowledgeContext}}
  sourceArticleIds: string[];
  usedFallback: boolean;
}

@Injectable()
export class KnowledgeBaseService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly vectorSearch: VectorSearchService,
    private readonly embeddingPipeline: EmbeddingPipelineService,
    @Inject(PRIMARY_VECTOR_STORE) private readonly vectorStore: VectorStoreProvider,
  ) {}

  async createArticle(input: CreateKnowledgeArticleInput) {
    const parsed = CreateKnowledgeArticleSchema.safeParse(input);
    if (!parsed.success) {
      throw new AIError('INPUT_VALIDATION_FAILED', 'Invalid knowledge article input', {
        internalDetail: JSON.stringify(parsed.error.issues),
      });
    }

    const article = await this.prisma.knowledgeArticle.create({ data: parsed.data });
    // Embed immediately so the article is retrievable right away. If this
    // fails, the article still exists — a retry/backfill job can re-embed it
    // later (Fallback requirement: creation isn't blocked by embedding).
    try {
      await this.embeddingPipeline.embedArticle({ knowledgeArticleId: article.id });
    } catch {
      // Swallowed intentionally; article creation must not fail because of
      // a downstream embedding hiccup. Logging hook goes here in the real
      // service (pino logger wired at the module level).
    }
    return article;
  }

  async updateArticleContent(id: string, content: string) {
    const article = await this.prisma.knowledgeArticle.update({ where: { id }, data: { content } });
    await this.embeddingPipeline.embedArticle({ knowledgeArticleId: article.id });
    return article;
  }

  async getArticle(id: string) {
    const article = await this.prisma.knowledgeArticle.findFirst({ where: { id, deletedAt: null } });
    if (!article) {
      throw new AIError('KNOWLEDGE_BASE_EMPTY', `KnowledgeArticle ${id} not found`);
    }
    return article;
  }

  async listArticles(params: { sourceType?: string; isActive?: boolean; skip?: number; take?: number } = {}) {
    const { sourceType, isActive, skip = 0, take = 25 } = params;
    return this.prisma.knowledgeArticle.findMany({
      where: {
        deletedAt: null,
        ...(sourceType ? { sourceType } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: Math.min(take, 100),
    });
  }

  /** Soft delete — Sec. 11. Also removes the article's chunks from the vector store. */
  async deleteArticle(id: string) {
    const embeddings = await this.prisma.embedding.findMany({ where: { knowledgeArticleId: id } });
    await this.prisma.$transaction([
      this.prisma.knowledgeArticle.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } }),
      this.prisma.embedding.deleteMany({ where: { knowledgeArticleId: id } }),
    ]);
    if (embeddings.length > 0) {
      await this.vectorStore.delete(embeddings.map((e) => e.vectorStoreId)).catch(() => undefined);
    }
  }

  /**
   * RAG retrieval entrypoint used by Chat/Recommendation flows to build the
   * `{{knowledgeContext}}` prompt variable.
   */
  async retrieveContext(input: RetrieveContextInput): Promise<RetrieveContextOutput> {
    const parsed = RetrieveContextInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new AIError('INPUT_VALIDATION_FAILED', 'Invalid retrieve-context input', {
        internalDetail: JSON.stringify(parsed.error.issues),
      });
    }

    const result = await this.vectorSearch.search({ query: parsed.data.query, topK: parsed.data.topK });
    if (result.matches.length === 0) {
      return { contextText: '', sourceArticleIds: [], usedFallback: result.usedFallback };
    }

    const contextText = result.matches.map((m, i) => `[${i + 1}] ${m.chunkText}`).join('\n\n');
    const sourceArticleIds = Array.from(new Set(result.matches.map((m) => m.knowledgeArticleId)));

    return { contextText, sourceArticleIds, usedFallback: result.usedFallback };
  }
}

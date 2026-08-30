import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';
import { VectorSearchService } from '../vector-search/vector-search.service';
import { EmbeddingPipelineService } from '../embedding-pipeline/embedding.service';
import { createMockPrisma, createMockVectorStore } from './mocks';

describe('KnowledgeBaseService', () => {
  function buildService() {
    const prisma = createMockPrisma();
    const vectorSearch = { search: jest.fn() } as unknown as VectorSearchService;
    const embeddingPipeline = { embedArticle: jest.fn().mockResolvedValue({ chunksCreated: 1, embeddingIds: ['e1'], vectorStoreFailures: 0 }) } as unknown as EmbeddingPipelineService;
    const vectorStore = createMockVectorStore();

    const service = new KnowledgeBaseService(prisma as any, vectorSearch, embeddingPipeline, vectorStore);
    return { service, prisma, vectorSearch, embeddingPipeline, vectorStore };
  }

  it('creates an article and triggers embedding immediately', async () => {
    const { service, prisma, embeddingPipeline } = buildService();
    const article = await service.createArticle({
      title: 'Kidney-friendly diets',
      content: 'Content about renal nutrition.',
      sourceType: 'medical_guideline',
    });

    expect(prisma.knowledgeArticle.create).toHaveBeenCalledTimes(1);
    expect(embeddingPipeline.embedArticle).toHaveBeenCalledWith({ knowledgeArticleId: article.id });
  });

  it('does not fail article creation when embedding fails', async () => {
    const { service, embeddingPipeline } = buildService();
    (embeddingPipeline.embedArticle as jest.Mock).mockRejectedValue(new Error('embedding down'));

    await expect(
      service.createArticle({ title: 'X', content: 'Y', sourceType: 'internal_policy' }),
    ).resolves.toBeDefined();
  });

  it('rejects invalid article input at the schema boundary', async () => {
    const { service } = buildService();
    await expect(service.createArticle({ title: '', content: '', sourceType: 'internal_policy' } as any)).rejects.toThrow();
  });

  it('updateArticleContent re-embeds after updating', async () => {
    const { service, prisma, embeddingPipeline } = buildService();
    prisma.knowledgeArticle.update.mockResolvedValue({ id: 'a1', content: 'new content' });

    await service.updateArticleContent('a1', 'new content');
    expect(embeddingPipeline.embedArticle).toHaveBeenCalledWith({ knowledgeArticleId: 'a1' });
  });

  it('retrieveContext builds numbered context text from vector search matches', async () => {
    const { service, vectorSearch } = buildService();
    (vectorSearch.search as jest.Mock).mockResolvedValue({
      matches: [
        { knowledgeArticleId: 'a1', chunkIndex: 0, chunkText: 'Low sodium foods help hypertension.', score: 0.9 },
        { knowledgeArticleId: 'a2', chunkIndex: 0, chunkText: 'Potassium matters for renal patients.', score: 0.85 },
      ],
      usedFallback: false,
    });

    const result = await service.retrieveContext({ query: 'hypertension diet' });

    expect(result.contextText).toContain('[1]');
    expect(result.contextText).toContain('[2]');
    expect(result.sourceArticleIds).toEqual(['a1', 'a2']);
  });

  it('retrieveContext returns empty context (not an error) when there are no matches', async () => {
    const { service, vectorSearch } = buildService();
    (vectorSearch.search as jest.Mock).mockResolvedValue({ matches: [], usedFallback: false });

    const result = await service.retrieveContext({ query: 'obscure topic' });
    expect(result.contextText).toBe('');
    expect(result.sourceArticleIds).toEqual([]);
  });

  it('deleteArticle soft-deletes and cleans up embeddings/vector store entries', async () => {
    const { service, prisma, vectorStore } = buildService();
    prisma.embedding.findMany.mockResolvedValue([{ id: 'e1', vectorStoreId: 'vec-1' }]);

    await service.deleteArticle('a1');

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(vectorStore.delete).toHaveBeenCalledWith(['vec-1']);
  });

  it('getArticle throws when the article is missing or soft-deleted', async () => {
    const { service, prisma } = buildService();
    prisma.knowledgeArticle.findFirst.mockResolvedValue(null);
    await expect(service.getArticle('missing-id')).rejects.toThrow();
  });
});

import { EmbeddingPipelineService } from '../embedding-pipeline/embedding.service';
import { AIProviderFactory } from '../providers/provider.factory';
import { createMockPrisma, createMockAIProvider, createMockVectorStore, createMockAIEnv } from './mocks';
import { chunkText, estimateTokens } from '../embedding-pipeline/chunker';

describe('chunker', () => {
  it('splits long text into multiple overlapping chunks', () => {
    const text = Array.from({ length: 500 }, (_, i) => `word${i}`).join(' ');
    const chunks = chunkText(text, 100, 10);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].index).toBe(0);
    // overlap: last words of chunk N should reappear at start of chunk N+1
    const lastWordsOfFirst = chunks[0].text.split(' ').slice(-5);
    const firstWordsOfSecond = chunks[1].text.split(' ').slice(0, 5);
    expect(lastWordsOfFirst.some((w) => firstWordsOfSecond.includes(w))).toBe(true);
  });

  it('returns a single chunk for short text', () => {
    const chunks = chunkText('short piece of text', 100, 10);
    expect(chunks).toHaveLength(1);
  });

  it('throws if chunkSizeTokens <= overlapTokens (no progress possible)', () => {
    expect(() => chunkText('some text', 10, 10)).toThrow();
  });

  it('estimateTokens gives a positive, monotonic-with-length estimate', () => {
    expect(estimateTokens('a')).toBeGreaterThan(0);
    expect(estimateTokens('a'.repeat(100))).toBeGreaterThan(estimateTokens('a'.repeat(10)));
  });
});

describe('EmbeddingPipelineService', () => {
  const ARTICLE_ID = '11111111-1111-1111-1111-111111111111';

  function buildService(articleContent = 'This is a knowledge base article about hydration and kidney health.') {
    const prisma = createMockPrisma();
    prisma.knowledgeArticle.findUnique.mockResolvedValue({ id: ARTICLE_ID, content: articleContent });

    const vectorStore = createMockVectorStore();
    const mockProvider = createMockAIProvider({
      embed: jest.fn().mockResolvedValue({ vectors: [[0.1, 0.2, 0.3]], dimensions: 3, model: 'test-embed', latencyMs: 5 }),
    });
    const providerFactory = {
      resolveForPurpose: jest.fn().mockResolvedValue({ provider: mockProvider, modelName: 'test-embed', temperature: 0, maxTokens: 0 }),
    } as unknown as AIProviderFactory;
    const env = createMockAIEnv({ EMBEDDING_CHUNK_SIZE_TOKENS: 1000, EMBEDDING_CHUNK_OVERLAP_TOKENS: 50 });

    const service = new EmbeddingPipelineService(prisma as any, vectorStore, providerFactory, env);
    return { service, prisma, vectorStore, mockProvider };
  }

  it('embeds a single-chunk article and persists Embedding + vector store rows', async () => {
    const { service, prisma, vectorStore } = buildService();
    const result = await service.embedArticle({ knowledgeArticleId: ARTICLE_ID });

    expect(result.chunksCreated).toBe(1);
    expect(result.embeddingIds).toHaveLength(1);
    expect(result.vectorStoreFailures).toBe(0);
    expect(prisma.embedding.create).toHaveBeenCalledTimes(1);
    expect(vectorStore.upsert).toHaveBeenCalledTimes(1);
  });

  it('removes prior embeddings before re-embedding (no stale chunks after a content edit)', async () => {
    const { service, prisma, vectorStore } = buildService();
    prisma.embedding.findMany.mockResolvedValue([{ id: 'old-1', vectorStoreId: 'old-vec-1' }]);

    await service.embedArticle({ knowledgeArticleId: ARTICLE_ID });

    expect(vectorStore.delete).toHaveBeenCalledWith(['old-vec-1']);
    expect(prisma.embedding.deleteMany).toHaveBeenCalledWith({ where: { knowledgeArticleId: ARTICLE_ID } });
  });

  it('throws when the article does not exist', async () => {
    const { service, prisma } = buildService();
    prisma.knowledgeArticle.findUnique.mockResolvedValue(null);
    await expect(service.embedArticle({ knowledgeArticleId: ARTICLE_ID })).rejects.toThrow();
  });

  it('records a vector store failure without losing the Postgres Embedding record', async () => {
    const { service, prisma, vectorStore } = buildService();
    (vectorStore.upsert as jest.Mock).mockRejectedValue(new Error('vector db down'));

    const result = await service.embedArticle({ knowledgeArticleId: ARTICLE_ID });

    expect(result.vectorStoreFailures).toBe(1);
    expect(prisma.embedding.create).toHaveBeenCalledTimes(1); // Postgres write still happened
  });

  it('rejects invalid input at the schema boundary', async () => {
    const { service } = buildService();
    await expect(service.embedArticle({ knowledgeArticleId: 'not-a-uuid' } as any)).rejects.toThrow();
  });
});

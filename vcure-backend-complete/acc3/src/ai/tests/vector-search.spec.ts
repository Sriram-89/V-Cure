import { VectorSearchService } from '../vector-search/vector-search.service';
import { AIProviderFactory } from '../providers/provider.factory';
import { createMockAIProvider, createMockVectorStore, createMockAIEnv } from './mocks';

describe('VectorSearchService', () => {
  function buildService() {
    const primaryStore = createMockVectorStore();
    const fallbackStore = createMockVectorStore();
    const mockProvider = createMockAIProvider({
      embed: jest.fn().mockResolvedValue({ vectors: [[0.1, 0.2, 0.3]], dimensions: 3, model: 'test-embed', latencyMs: 5 }),
    });
    const providerFactory = {
      resolveForPurpose: jest.fn().mockResolvedValue({ provider: mockProvider, modelName: 'test-embed' }),
    } as unknown as AIProviderFactory;
    const env = createMockAIEnv();

    const service = new VectorSearchService(primaryStore, fallbackStore, providerFactory, env);
    return { service, primaryStore, fallbackStore, mockProvider };
  }

  it('embeds the query and returns matches from the primary vector store', async () => {
    const { service, primaryStore } = buildService();
    (primaryStore.query as jest.Mock).mockResolvedValue([
      { id: 'v1', score: 0.9, metadata: { knowledgeArticleId: 'a1', chunkIndex: 0, chunkText: 'chunk text' } },
    ]);

    const result = await service.search({ query: 'what foods help kidney health?' });

    expect(result.usedFallback).toBe(false);
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0].knowledgeArticleId).toBe('a1');
  });

  it('falls back to the secondary vector store when the primary fails health check', async () => {
    const { service, primaryStore, fallbackStore } = buildService();
    (primaryStore.healthCheck as jest.Mock).mockResolvedValue(false);
    (fallbackStore.query as jest.Mock).mockResolvedValue([
      { id: 'v2', score: 0.8, metadata: { knowledgeArticleId: 'a2', chunkIndex: 1, chunkText: 'fallback chunk' } },
    ]);

    const result = await service.search({ query: 'test query' });

    expect(result.usedFallback).toBe(true);
    expect(result.matches[0].knowledgeArticleId).toBe('a2');
    expect(primaryStore.query).not.toHaveBeenCalled();
  });

  it('falls back to the secondary store when the primary query throws', async () => {
    const { service, primaryStore, fallbackStore } = buildService();
    (primaryStore.query as jest.Mock).mockRejectedValue(new Error('timeout'));
    (fallbackStore.query as jest.Mock).mockResolvedValue([]);

    const result = await service.search({ query: 'test query' });
    expect(result.usedFallback).toBe(true);
  });

  it('rejects invalid input at the schema boundary', async () => {
    const { service } = buildService();
    await expect(service.search({ query: '' })).rejects.toThrow();
  });

  it('respects custom topK/minScore overrides', async () => {
    const { service, primaryStore } = buildService();
    await service.search({ query: 'test', topK: 3, minScore: 0.9 });
    expect(primaryStore.query).toHaveBeenCalledWith(expect.any(Array), 3, 0.9);
  });
});

/**
 * VECTOR SEARCH LAYER — Provider Contract
 *
 * The `Embedding` Prisma model stores only a pointer (`vectorStoreId`) plus
 * metadata into whatever external vector database V-Cure uses
 * (Sec. AI TECH STACK: "Vector Database"). This interface is the seam: swap
 * providers (Pinecone, Weaviate, Qdrant, pgvector-over-HTTP, ...) without
 * touching EmbeddingPipelineService or VectorSearchService.
 */

export interface VectorRecord {
  id: string; // matches Embedding.vectorStoreId
  vector: number[];
  metadata: {
    knowledgeArticleId: string;
    chunkIndex: number;
    chunkText: string;
  };
}

export interface VectorMatch {
  id: string;
  score: number; // 0.0 - 1.0, cosine similarity
  metadata: VectorRecord['metadata'];
}

export interface VectorStoreProvider {
  upsert(records: VectorRecord[]): Promise<void>;
  query(vector: number[], topK: number, minScore: number): Promise<VectorMatch[]>;
  delete(ids: string[]): Promise<void>;
  healthCheck(): Promise<boolean>;
}

import { Injectable } from '@nestjs/common';
import { VectorStoreProvider, VectorRecord, VectorMatch } from '../vector-store.interface';

/**
 * In-memory vector store. Used as:
 * 1. The default provider in unit tests (no external dependency).
 * 2. The automatic Fallback when VECTOR_DB_URL is unset or the configured
 *    store fails healthCheck() — RAG degrades to "no external matches"
 *    rather than crashing the AI layer.
 *
 * Not for production use at scale (linear scan cosine similarity), but
 * correct, dependency-free, and good enough for small knowledge bases during
 * early rollout.
 */
@Injectable()
export class InMemoryVectorStoreProvider implements VectorStoreProvider {
  private readonly store = new Map<string, VectorRecord>();

  async upsert(records: VectorRecord[]): Promise<void> {
    for (const r of records) this.store.set(r.id, r);
  }

  async query(vector: number[], topK: number, minScore: number): Promise<VectorMatch[]> {
    const scored: VectorMatch[] = [];
    for (const record of this.store.values()) {
      const score = cosineSimilarity(vector, record.vector);
      if (score >= minScore) {
        scored.push({ id: record.id, score, metadata: record.metadata });
      }
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  async delete(ids: string[]): Promise<void> {
    for (const id of ids) this.store.delete(id);
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  /** Test/debug helper only. */
  size(): number {
    return this.store.size;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

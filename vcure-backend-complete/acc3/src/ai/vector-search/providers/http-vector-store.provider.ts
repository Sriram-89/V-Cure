import { Injectable, Inject } from '@nestjs/common';
import { VectorStoreProvider, VectorRecord, VectorMatch } from '../vector-store.interface';
import { ProviderError } from '../../errors/ai.errors';
import { AIEnv } from '../../config/ai.config';
import { AI_ENV } from '../../ai.tokens';

/**
 * Generic REST-based vector store provider. Works against any vector DB that
 * exposes upsert/query/delete over HTTP (Pinecone, Qdrant, Weaviate, and
 * most managed vector DBs fit this shape closely enough that only the
 * request/response mapping below would need adjusting per-vendor).
 *
 * VECTOR_DB_URL is the only required config — no vendor SDK dependency is
 * introduced at the AI-foundation layer, keeping the provider swap trivial.
 */
@Injectable()
export class HttpVectorStoreProvider implements VectorStoreProvider {
  private readonly baseUrl: string;

  constructor(@Inject(AI_ENV) env: AIEnv) {
    this.baseUrl = env.VECTOR_DB_URL ?? '';
  }

  async upsert(records: VectorRecord[]): Promise<void> {
    if (!this.baseUrl) {
      throw new ProviderError('PROVIDER_UNAVAILABLE', 'VECTOR_DB_URL is not configured');
    }
    const response = await fetch(`${this.baseUrl}/vectors/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vectors: records.map((r) => ({ id: r.id, values: r.vector, metadata: r.metadata })),
      }),
    });
    if (!response.ok) {
      throw new ProviderError('VECTOR_SEARCH_FAILED' as any, `Vector store upsert failed with HTTP ${response.status}`);
    }
  }

  async query(vector: number[], topK: number, minScore: number): Promise<VectorMatch[]> {
    if (!this.baseUrl) {
      throw new ProviderError('PROVIDER_UNAVAILABLE', 'VECTOR_DB_URL is not configured');
    }
    const response = await fetch(`${this.baseUrl}/vectors/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vector, topK, includeMetadata: true }),
    });
    if (!response.ok) {
      throw new ProviderError('VECTOR_SEARCH_FAILED' as any, `Vector store query failed with HTTP ${response.status}`);
    }
    const body = (await response.json()) as { matches: { id: string; score: number; metadata: VectorMatch['metadata'] }[] };
    return body.matches.filter((m) => m.score >= minScore);
  }

  async delete(ids: string[]): Promise<void> {
    if (!this.baseUrl) return;
    await fetch(`${this.baseUrl}/vectors/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
  }

  async healthCheck(): Promise<boolean> {
    if (!this.baseUrl) return false;
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

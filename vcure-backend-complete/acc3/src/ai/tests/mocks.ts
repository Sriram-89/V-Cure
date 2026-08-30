/**
 * AI FOUNDATION — Shared Test Mocks
 *
 * A hand-rolled deep mock of the slice of PrismaClient the AI layer touches,
 * plus fixture builders. No real database or network call happens in any
 * spec that uses these — every AI-layer test is a pure unit/integration test
 * against these mocks (see README-AI.md "Testing Strategy" for why: this
 * sandbox has no DB/network access, so these mocks are also how the code was
 * verified to be internally consistent without live infrastructure).
 */
import { AIProvider, CompletionResponse, EmbeddingResponse } from '../interfaces/ai-provider.interface';
import { VisionProvider, OCRTextResult } from '../interfaces/vision-provider.interface';
import { VectorStoreProvider, VectorMatch } from '../vector-search/vector-store.interface';
import { AIEnv } from '../config/ai.config';

export function createMockPrisma() {
  return {
    allergy: { findMany: jest.fn().mockResolvedValue([]) },
    medicalCondition: { findMany: jest.fn().mockResolvedValue([]), findFirst: jest.fn().mockResolvedValue(null) },
    medicine: { findMany: jest.fn().mockResolvedValue([]) },
    foodRestriction: { findFirst: jest.fn().mockResolvedValue(null) },
    foodMedicineInteraction: { findMany: jest.fn().mockResolvedValue([]) },
    foodNutrition: { findMany: jest.fn().mockResolvedValue([]) },
    food: { findMany: jest.fn().mockResolvedValue([]) },
    healthProfile: { findUnique: jest.fn().mockResolvedValue(null) },
    lifestyle: { findUnique: jest.fn().mockResolvedValue(null) },
    safetyValidation: { create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'sv-1', ...data })) },
    mealRecommendation: {
      create: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({ id: 'mr-1', ...data, reasons: (data.reasons?.create ?? []).map((r: any, i: number) => ({ id: `reason-${i}`, ...r })) }),
      ),
    },
    mealReason: { create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'reason-1', ...data })) },
    recommendationLog: { create: jest.fn().mockResolvedValue({ id: 'log-1' }) },
    promptTemplate: { findFirst: jest.fn().mockResolvedValue(null), findUnique: jest.fn().mockResolvedValue(null) },
    promptHistory: { create: jest.fn().mockResolvedValue({ id: 'ph-1' }) },
    modelConfiguration: { findFirst: jest.fn().mockResolvedValue(null) },
    knowledgeArticle: {
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'ka-1', ...data })),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'ka-1', ...data })),
    },
    embedding: {
      findMany: jest.fn().mockResolvedValue([]),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: `emb-${Math.random()}`, ...data })),
    },
    oCRResult: {
      create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'ocr-1', ...data })),
      update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'ocr-1', ...data })),
    },
    labResult: { create: jest.fn().mockResolvedValue({ id: 'lab-1' }) },
    $transaction: jest.fn().mockImplementation((ops: any) => (Array.isArray(ops) ? Promise.all(ops) : ops())),
  };
}

export function createMockAIProvider(overrides: Partial<AIProvider> = {}): AIProvider {
  return {
    name: 'OPENAI_COMPATIBLE',
    complete: jest.fn().mockResolvedValue({
      content: '{}',
      finishReason: 'stop',
      latencyMs: 10,
    } satisfies CompletionResponse),
    embed: jest.fn().mockResolvedValue({
      vectors: [[0.1, 0.2, 0.3]],
      dimensions: 3,
      model: 'test-embedding-model',
      latencyMs: 10,
    } satisfies EmbeddingResponse),
    healthCheck: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

export function createMockVisionProvider(overrides: Partial<VisionProvider> = {}): VisionProvider {
  return {
    extractText: jest.fn().mockResolvedValue({ rawText: 'Hemoglobin 13.5 g/dL', latencyMs: 10 } satisfies OCRTextResult),
    ...overrides,
  };
}

export function createMockVectorStore(overrides: Partial<VectorStoreProvider> = {}): VectorStoreProvider {
  return {
    upsert: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue([] as VectorMatch[]),
    delete: jest.fn().mockResolvedValue(undefined),
    healthCheck: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
}

export function createMockAIEnv(overrides: Partial<AIEnv> = {}): AIEnv {
  return {
    OPENAI_API_KEY: 'test-key',
    GEMINI_API_KEY: 'test-key',
    VECTOR_DB_URL: undefined,
    AI_DEFAULT_PROVIDER: 'OPENAI_COMPATIBLE',
    AI_REQUEST_TIMEOUT_MS: 5000,
    AI_MAX_RETRIES: 1,
    AI_RETRY_BACKOFF_MS: 10,
    EMBEDDING_MODEL: 'text-embedding-3-large',
    EMBEDDING_DIMENSIONS: 3,
    EMBEDDING_CHUNK_SIZE_TOKENS: 100,
    EMBEDDING_CHUNK_OVERLAP_TOKENS: 10,
    VECTOR_SEARCH_TOP_K: 5,
    VECTOR_SEARCH_MIN_SCORE: 0.5,
    ...overrides,
  };
}

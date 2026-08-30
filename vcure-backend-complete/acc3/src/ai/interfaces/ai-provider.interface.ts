import { z } from 'zod';

/**
 * AI FOUNDATION — Provider Contract
 *
 * Every provider (OpenAI-compatible, Gemini) implements this interface so the
 * rest of the AI layer (Prompt Builder, Safety Engine, Recommendation Engine)
 * never depends on a specific vendor SDK. This is what "Never redesign the
 * architecture, always extend" means at the provider boundary — new
 * providers plug in without touching consumers.
 */

export const ChatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string().min(1),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const CompletionRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1),
  model: z.string().min(1),
  temperature: z.number().min(0).max(2).default(0.3),
  maxTokens: z.number().int().positive().default(1024),
  /** Correlation id for logging/tracing — never logged alongside PHI. */
  requestId: z.string().uuid(),
  /** Purpose tag used for AIUsage accounting, e.g. "meal_recommendation". */
  operation: z.string().min(1),
});
export type CompletionRequest = z.infer<typeof CompletionRequestSchema>;

export const CompletionResponseSchema = z.object({
  content: z.string(),
  promptTokens: z.number().int().nonnegative().optional(),
  completionTokens: z.number().int().nonnegative().optional(),
  finishReason: z.enum(['stop', 'length', 'content_filter', 'error']).default('stop'),
  latencyMs: z.number().int().nonnegative(),
});
export type CompletionResponse = z.infer<typeof CompletionResponseSchema>;

export const EmbeddingRequestSchema = z.object({
  input: z.array(z.string().min(1)).min(1),
  model: z.string().min(1),
  requestId: z.string().uuid(),
});
export type EmbeddingRequest = z.infer<typeof EmbeddingRequestSchema>;

export const EmbeddingResponseSchema = z.object({
  vectors: z.array(z.array(z.number())).min(1),
  dimensions: z.number().int().positive(),
  model: z.string(),
  latencyMs: z.number().int().nonnegative(),
});
export type EmbeddingResponse = z.infer<typeof EmbeddingResponseSchema>;

/**
 * Provider implementations MUST NOT throw raw SDK exceptions — they must
 * catch and rethrow as `ProviderError` (see errors/ai.errors.ts) so callers
 * get a consistent, safety-reviewed error surface.
 */
export interface AIProvider {
  readonly name: 'OPENAI_COMPATIBLE' | 'GEMINI';
  complete(request: CompletionRequest): Promise<CompletionResponse>;
  embed(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  /** Lightweight liveness check used by health monitoring (Use Case 48). */
  healthCheck(): Promise<boolean>;
}

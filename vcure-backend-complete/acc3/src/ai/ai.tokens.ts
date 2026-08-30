/**
 * AI FOUNDATION — DI Tokens
 *
 * NestJS can only auto-resolve class constructors by type. Plain values
 * (config objects, base URL strings) and cases where two providers implement
 * the same interface (primary vs. fallback vector store) need explicit
 * tokens. Centralizing them here avoids magic strings scattered across
 * provider declarations.
 */
export const AI_ENV = Symbol('AI_ENV');
export const PRISMA_CLIENT = Symbol('PRISMA_CLIENT');
export const PRIMARY_VECTOR_STORE = Symbol('PRIMARY_VECTOR_STORE');
export const FALLBACK_VECTOR_STORE = Symbol('FALLBACK_VECTOR_STORE');
export const OPENAI_BASE_URL = Symbol('OPENAI_BASE_URL');
export const GEMINI_BASE_URL = Symbol('GEMINI_BASE_URL');

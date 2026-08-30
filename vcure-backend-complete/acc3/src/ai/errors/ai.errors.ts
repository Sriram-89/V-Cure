/**
 * AI FOUNDATION — Error Hierarchy
 *
 * Every AI module must include structured Error Handling (Phase 2 requirement).
 * All AI-layer errors extend AIError so callers can branch on `.code` instead
 * of parsing message strings, and so no internal AI logic/prompt content ever
 * leaks into a message that could reach a client (Sec. Security — "Never
 * expose internal AI logic").
 */

export type AIErrorCode =
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_RATE_LIMITED'
  | 'PROVIDER_UNAVAILABLE'
  | 'PROVIDER_INVALID_RESPONSE'
  | 'PROMPT_TEMPLATE_NOT_FOUND'
  | 'PROMPT_VARIABLE_MISSING'
  | 'INPUT_VALIDATION_FAILED'
  | 'OUTPUT_VALIDATION_FAILED'
  | 'SAFETY_BLOCKED'
  | 'RULE_ENGINE_REJECTED'
  | 'KNOWLEDGE_BASE_EMPTY'
  | 'VECTOR_SEARCH_FAILED'
  | 'EMBEDDING_FAILED'
  | 'OCR_FAILED'
  | 'PIPELINE_STAGE_FAILED'
  | 'UNKNOWN';

export class AIError extends Error {
  public readonly code: AIErrorCode;
  /** Safe to log internally; never render this field to end users. */
  public readonly internalDetail?: string;
  public readonly cause?: unknown;

  constructor(code: AIErrorCode, message: string, opts?: { internalDetail?: string; cause?: unknown }) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.internalDetail = opts?.internalDetail;
    this.cause = opts?.cause;
  }

  /** User-safe message — never includes prompts, provider internals, or stack traces. */
  toUserMessage(): string {
    switch (this.code) {
      case 'SAFETY_BLOCKED':
        return 'This recommendation could not be generated because it did not pass a required safety check.';
      case 'PROVIDER_TIMEOUT':
      case 'PROVIDER_UNAVAILABLE':
      case 'PROVIDER_RATE_LIMITED':
        return 'The AI service is temporarily unavailable. Please try again shortly.';
      default:
        return 'Something went wrong while generating your recommendation. Please try again.';
    }
  }
}

export class ProviderError extends AIError {
  constructor(code: Extract<AIErrorCode, 'PROVIDER_TIMEOUT' | 'PROVIDER_RATE_LIMITED' | 'PROVIDER_UNAVAILABLE' | 'PROVIDER_INVALID_RESPONSE'>, message: string, opts?: { internalDetail?: string; cause?: unknown }) {
    super(code, message, opts);
    this.name = 'ProviderError';
  }
}

export class ValidationError extends AIError {
  public readonly fieldErrors?: Record<string, string[]>;
  constructor(code: Extract<AIErrorCode, 'INPUT_VALIDATION_FAILED' | 'OUTPUT_VALIDATION_FAILED'>, message: string, fieldErrors?: Record<string, string[]>) {
    super(code, message);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export class SafetyBlockedError extends AIError {
  public readonly safetyValidationId: string;
  constructor(message: string, safetyValidationId: string) {
    super('SAFETY_BLOCKED', message);
    this.name = 'SafetyBlockedError';
    this.safetyValidationId = safetyValidationId;
  }
}

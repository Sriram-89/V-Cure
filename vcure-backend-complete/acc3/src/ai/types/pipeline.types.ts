/**
 * AI FOUNDATION — Pipeline Contract
 *
 * AI___DESIGN master prompt, "AI RULES":
 *   Every AI response must pass through
 *     Safety Engine -> Rule Engine -> Validation Layer -> Formatter
 *   Never return raw LLM output.
 *
 * This file defines the shared shape every engine's output must carry so the
 * Recommendation Engine (and any future consumer) can compose them into a
 * single pipeline without bespoke glue code per engine.
 */

export type PipelineStage = 'SAFETY' | 'RULE' | 'VALIDATION' | 'FORMATTER';

export interface PipelineStageResult<T> {
  stage: PipelineStage;
  passed: boolean;
  data?: T;
  blockedReason?: string;
  durationMs: number;
}

export interface PipelineTrace {
  requestId: string;
  stages: PipelineStageResult<unknown>[];
  startedAt: string; // ISO 8601, UTC (Sec. 24 Timezone Policy)
  completedAt?: string;
}

/**
 * Final output shape returned to any consumer (controller, job, etc.).
 * `raw` is intentionally absent from this type — formatted output only ever
 * flows downstream. Raw LLM output stays inside the pipeline and is not part
 * of this public contract.
 */
export interface PipelineResult<T> {
  success: boolean;
  data?: T;
  blockedReason?: string;
  errorCode?: string;
  trace: PipelineTrace;
}

/** Every rule engine (Medical, Nutrition, Safety) reports findings in this shape. */
export interface RuleFinding {
  ruleName: string;
  passed: boolean;
  severity: 'INFO' | 'WARNING' | 'BLOCKING';
  message: string;
}

export interface RuleEngineResult {
  passed: boolean;
  findings: RuleFinding[];
}

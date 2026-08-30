/**
 * ACC3 AI foundation — integration CONTRACTS ONLY.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * PROVENANCE — read before changing anything here.
 *
 * The shapes below were supplied by the product owner as ACC3's integration
 * contract. They were NOT read from ACC3 source: the supplied archive
 * (`vcure-backend-ai-foundation-release.zip`) still contains 35 directory
 * entries and ZERO files, and greps for `SafetyEngineService`,
 * `RecommendationEngineFoundationService`, `ExplainabilityEngineService` and
 * `OCRFoundationService` return no matches.
 *
 * Consequently this file declares a PORT, not an implementation:
 *   - no engine logic lives here or anywhere in ACC2,
 *   - no stub, mock or fake provider is registered,
 *   - nothing in ACC2 currently depends on these tokens at runtime.
 *
 * When the real ACC3 package lands, bind the tokens below to its exported
 * services and reconcile these interfaces against its actual signatures. If
 * they differ, ACC3's real signatures win — these are a placeholder contract,
 * not an authority.
 * ────────────────────────────────────────────────────────────────────────────
 */

// ----------------------------------------------------------------- Safety
export interface SafetyCheckInput {
  userId: string;
  proposedFoodIds: string[];
  proposalSummary?: string;
}

export interface SafetyRuleOutcome {
  rule: string;
  passed: boolean;
  detail?: string;
}

export interface SafetyCheckOutput {
  safetyValidationId: string;
  result: string;
  blockedReason: string | null;
  ruleOutcomes: SafetyRuleOutcome[];
  checkedAllergies: string[];
  checkedMedicines: string[];
  checkedConditions: string[];
}

export interface SafetyEnginePort {
  check(input: SafetyCheckInput): Promise<SafetyCheckOutput>;
  checkOrThrow(input: SafetyCheckInput): Promise<SafetyCheckOutput>;
}

// --------------------------------------------------------- Recommendation
export interface RecommendationInput {
  userId: string;
  mealId: string;
  mealType: string;
  candidateFoodIds: string[];
}

export interface RecommendationEnginePort {
  generate(input: RecommendationInput): Promise<unknown>;
}

// --------------------------------------------------------- Explainability
export interface ExplainabilityOutput {
  explanation: string;
  keyNutrients: string[];
  mealReasonIds: string[];
}

export interface ExplainabilityEnginePort {
  explain(input: unknown): Promise<ExplainabilityOutput>;
}

// -------------------------------------------------------------------- OCR
export interface OcrPort {
  run(input: unknown): Promise<unknown>;
}

/** DI tokens. Bind these to the real ACC3 services when the package exists. */
export const SAFETY_ENGINE = Symbol('SAFETY_ENGINE');
export const RECOMMENDATION_ENGINE = Symbol('RECOMMENDATION_ENGINE');
export const EXPLAINABILITY_ENGINE = Symbol('EXPLAINABILITY_ENGINE');
export const OCR_ENGINE = Symbol('OCR_ENGINE');

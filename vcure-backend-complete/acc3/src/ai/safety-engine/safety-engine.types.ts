import { z } from 'zod';

/**
 * SAFETY ENGINE — Shared Types
 *
 * Sec. 54 HEALTHCARE SAFETY RULES + AI___DESIGN "AI must always follow
 * Healthcare Safety Rules" — this engine is DETERMINISTIC FIRST. It never
 * relies solely on an LLM judgement call for a blocking decision; the LLM
 * safety-validation template (safety_validation_v1) is strictly supplementary
 * pattern-matching, and can only ever make the result MORE conservative
 * (flag something the deterministic rules missed), never less.
 */

export const SafetyCheckInputSchema = z.object({
  userId: z.string().uuid(),
  /** Food ids that make up the proposed meal/recipe (ingredients or the food itself). */
  proposedFoodIds: z.array(z.string().uuid()).min(1),
  /** Optional free-text description of the proposal, used only for the supplementary LLM pass. */
  proposalSummary: z.string().optional(),
});
export type SafetyCheckInput = z.infer<typeof SafetyCheckInputSchema>;

export type SafetyResultCode =
  | 'PASSED'
  | 'BLOCKED_ALLERGY'
  | 'BLOCKED_MEDICAL_CONDITION'
  | 'BLOCKED_MEDICINE_INTERACTION'
  | 'BLOCKED_OTHER';

export interface SafetyRuleOutcome {
  ruleName: string;
  passed: boolean;
  resultCode: SafetyResultCode;
  reason?: string;
}

export interface SafetyCheckOutput {
  safetyValidationId: string;
  result: SafetyResultCode;
  blockedReason?: string;
  ruleOutcomes: SafetyRuleOutcome[];
  checkedAllergies: boolean;
  checkedMedicines: boolean;
  checkedConditions: boolean;
}

/** Every deterministic rule module implements this contract. */
export interface SafetyRule {
  readonly name: string;
  evaluate(context: SafetyRuleContext): Promise<SafetyRuleOutcome>;
}

export interface SafetyRuleContext {
  userId: string;
  proposedFoodIds: string[];
}

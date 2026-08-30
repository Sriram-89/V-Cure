import { z } from 'zod';
import { RuleFinding, RuleEngineResult } from '../types/pipeline.types';

/**
 * MEDICAL RULE ENGINE — Shared Types
 *
 * Distinct from the Safety Engine: Safety Engine answers a binary
 * "can this be shown at all" question via hard relational matches
 * (allergy/critical-condition/medicine). The Medical Rule Engine answers a
 * softer "how well does this fit the user's medical picture" question via
 * nutrient-threshold guidance per condition (Sec. 54 disease-specific rules,
 * Sec. AI RESPONSIBILITIES "Rule Engine"). A WARNING finding here does not
 * block a recommendation; a SafetyEngine BLOCKING result upstream already
 * would have stopped the pipeline before this engine runs.
 */

export const MedicalRuleCheckInputSchema = z.object({
  userId: z.string().uuid(),
  proposedFoodIds: z.array(z.string().uuid()).min(1),
});
export type MedicalRuleCheckInput = z.infer<typeof MedicalRuleCheckInputSchema>;

export interface MedicalRuleContext {
  userId: string;
  proposedFoodIds: string[];
}

export interface MedicalRule {
  readonly name: string;
  /** Only evaluates conditions this rule owns; returns null findings-worthy result if the condition isn't present for the user. */
  evaluate(context: MedicalRuleContext): Promise<RuleFinding[]>;
}

export type MedicalRuleCheckOutput = RuleEngineResult;

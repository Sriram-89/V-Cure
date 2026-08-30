import { Injectable } from '@nestjs/common';
import {
  MedicalRuleCheckInput,
  MedicalRuleCheckInputSchema,
  MedicalRuleCheckOutput,
  MedicalRule,
} from './medical-rule-engine.types';
import { DiabetesRule, HypertensionRule } from './rules/metabolic-cardio.rule';
import { RenalRule, HepaticRule, PregnancyRule } from './rules/renal-hepatic-pregnancy.rule';
import { AIError } from '../errors/ai.errors';
import { RuleFinding } from '../types/pipeline.types';

/**
 * MEDICAL RULE ENGINE — Service
 *
 * Input Schema:  MedicalRuleCheckInput  { userId, proposedFoodIds }
 * Output Schema: MedicalRuleCheckOutput { passed, findings }
 *
 * Stage 2 of the mandatory pipeline (runs AFTER Safety Engine has already
 * passed — this engine assumes the proposal is not already blocked).
 * `passed` here is true unless a rule reports a BLOCKING finding, which by
 * design none of the current rules do (see individual rule files) — hard
 * blocks live in the Safety Engine. This engine exists to surface guidance,
 * not to gate.
 */
@Injectable()
export class MedicalRuleEngineService {
  private readonly rules: MedicalRule[];

  constructor(
    diabetesRule: DiabetesRule,
    hypertensionRule: HypertensionRule,
    renalRule: RenalRule,
    hepaticRule: HepaticRule,
    pregnancyRule: PregnancyRule,
  ) {
    this.rules = [diabetesRule, hypertensionRule, renalRule, hepaticRule, pregnancyRule];
  }

  async evaluate(input: MedicalRuleCheckInput): Promise<MedicalRuleCheckOutput> {
    const parsed = MedicalRuleCheckInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new AIError('INPUT_VALIDATION_FAILED', 'Invalid medical rule check input', {
        internalDetail: JSON.stringify(parsed.error.issues),
      });
    }

    const findingsPerRule = await Promise.all(
      this.rules.map((rule) => rule.evaluate({ userId: parsed.data.userId, proposedFoodIds: parsed.data.proposedFoodIds })),
    );
    const findings: RuleFinding[] = findingsPerRule.flat();
    const passed = !findings.some((f) => f.severity === 'BLOCKING' && !f.passed);

    return { passed, findings };
  }
}

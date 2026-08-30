import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  SafetyCheckInput,
  SafetyCheckInputSchema,
  SafetyCheckOutput,
  SafetyResultCode,
  SafetyRule,
  SafetyRuleOutcome,
} from './safety-engine.types';
import { AllergyRule } from './rules/allergy.rule';
import { MedicalConditionRule } from './rules/medical-condition.rule';
import { MedicineInteractionRule } from './rules/medicine-interaction.rule';
import { AIError, SafetyBlockedError } from '../errors/ai.errors';

/**
 * SAFETY ENGINE — Service
 *
 * Input Schema:  SafetyCheckInput  { userId, proposedFoodIds, proposalSummary? }
 * Output Schema: SafetyCheckOutput { safetyValidationId, result, blockedReason?, ruleOutcomes, checked* }
 *
 * This is stage 1 of the mandatory AI RULES pipeline:
 *   Safety Engine -> Rule Engine -> Validation Layer -> Formatter
 *
 * Every deterministic rule runs (never short-circuits on first failure) so a
 * single `SafetyValidation` row captures the FULL picture for audit purposes
 * — a blocked-for-allergy result still reports what the medicine-interaction
 * rule found, which matters for Sec. 63 Audit Logging and for clinicians
 * reviewing why a recommendation was rejected.
 *
 * The result is persisted as a `SafetyValidation` row (Sec. 39 Recommendation
 * Domain) BEFORE being returned, so every safety decision — pass or block —
 * is durable and auditable, never just an in-memory judgement.
 */
@Injectable()
export class SafetyEngineService {
  private readonly rules: SafetyRule[];

  constructor(
    private readonly prisma: PrismaClient,
    allergyRule: AllergyRule,
    medicalConditionRule: MedicalConditionRule,
    medicineInteractionRule: MedicineInteractionRule,
  ) {
    this.rules = [allergyRule, medicalConditionRule, medicineInteractionRule];
  }

  async check(input: SafetyCheckInput): Promise<SafetyCheckOutput> {
    const parsed = SafetyCheckInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new AIError('INPUT_VALIDATION_FAILED', 'Invalid safety check input', {
        internalDetail: JSON.stringify(parsed.error.issues),
      });
    }
    const { userId, proposedFoodIds } = parsed.data;

    const outcomes: SafetyRuleOutcome[] = await Promise.all(
      this.rules.map((rule) => rule.evaluate({ userId, proposedFoodIds })),
    );

    const failed = outcomes.filter((o) => !o.passed);
    const result: SafetyResultCode = failed.length > 0 ? failed[0].resultCode : 'PASSED';
    const blockedReason = failed.length > 0 ? failed.map((f) => f.reason).filter(Boolean).join(' | ') : undefined;

    const record = await this.prisma.safetyValidation.create({
      data: {
        userId,
        result,
        blockedReason,
        checkedAllergies: true,
        checkedMedicines: true,
        checkedConditions: true,
      },
    });

    return {
      safetyValidationId: record.id,
      result,
      blockedReason,
      ruleOutcomes: outcomes,
      checkedAllergies: true,
      checkedMedicines: true,
      checkedConditions: true,
    };
  }

  /** Convenience helper — throws SafetyBlockedError instead of returning a blocked result, for callers that want fail-fast semantics. */
  async checkOrThrow(input: SafetyCheckInput): Promise<SafetyCheckOutput> {
    const output = await this.check(input);
    if (output.result !== 'PASSED') {
      throw new SafetyBlockedError(output.blockedReason ?? 'Blocked by Safety Engine', output.safetyValidationId);
    }
    return output;
  }
}

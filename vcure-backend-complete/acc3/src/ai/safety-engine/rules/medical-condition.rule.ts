import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SafetyRule, SafetyRuleContext, SafetyRuleOutcome } from '../safety-engine.types';

/**
 * MEDICAL CONDITION RULE
 *
 * Sec. 54: "Never ignore kidney disease. Never ignore liver disease. Never
 * ignore pregnancy." — those three (and any other Disease seeded with
 * isCritical=true, see prisma/seed/catalogs.seed.ts) are checked first and
 * block on ANY matching FoodRestriction, without exception. Non-critical
 * chronic conditions still block on a direct FoodRestriction match, but are
 * reported with a distinguishable reason so the Rule Engine layer can later
 * decide whether a softer path (e.g. "smaller portion") applies — that
 * softening logic lives in the Medical Rule Engine, NOT here. This rule only
 * ever returns PASSED or BLOCKED; it never partially approves.
 */
@Injectable()
export class MedicalConditionRule implements SafetyRule {
  readonly name = 'MedicalConditionRule';

  constructor(private readonly prisma: PrismaClient) {}

  async evaluate(context: SafetyRuleContext): Promise<SafetyRuleOutcome> {
    const activeConditions = await this.prisma.medicalCondition.findMany({
      where: { userId: context.userId, deletedAt: null, isActive: true },
      select: {
        diseaseId: true,
        disease: { select: { name: true, isCritical: true } },
      },
    });

    if (activeConditions.length === 0) {
      return { ruleName: this.name, passed: true, resultCode: 'PASSED' };
    }

    const diseaseIds = activeConditions.map((c) => c.diseaseId);

    const conflicting = await this.prisma.foodRestriction.findFirst({
      where: {
        foodId: { in: context.proposedFoodIds },
        type: { in: ['DISEASE'] },
        diseaseId: { in: diseaseIds },
      },
      include: { food: { select: { name: true } } },
    });

    if (conflicting) {
      const condition = activeConditions.find((c) => c.diseaseId === conflicting.diseaseId);
      const criticalTag = condition?.disease.isCritical ? ' [CRITICAL CONDITION]' : '';
      return {
        ruleName: this.name,
        passed: false,
        resultCode: 'BLOCKED_MEDICAL_CONDITION',
        reason: `Proposed food "${conflicting.food.name}" conflicts with active condition: ${condition?.disease.name ?? 'unknown'}${criticalTag}.`,
      };
    }

    return { ruleName: this.name, passed: true, resultCode: 'PASSED' };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MedicalRule, MedicalRuleContext } from '../medical-rule-engine.types';
import { RuleFinding } from '../../types/pipeline.types';

const DIABETES_NAMES = ['Type 2 Diabetes', 'Gestational Diabetes'];
const SUGAR_WARNING_THRESHOLD_G = 15; // per proposed food item

/**
 * DIABETES RULE
 * Sec. 54: diabetic dietary guidance — flag high-sugar foods as a WARNING,
 * not a hard block (a diabetic user isn't universally forbidden from any
 * sugar; portion/frequency matters, which is a judgement for the
 * Recommendation Engine + Explainability layer to convey, not this rule).
 */
@Injectable()
export class DiabetesRule implements MedicalRule {
  readonly name = 'DiabetesRule';

  constructor(private readonly prisma: PrismaClient) {}

  async evaluate(context: MedicalRuleContext): Promise<RuleFinding[]> {
    const hasDiabetes = await this.prisma.medicalCondition.findFirst({
      where: {
        userId: context.userId,
        deletedAt: null,
        isActive: true,
        disease: { name: { in: DIABETES_NAMES } },
      },
    });
    if (!hasDiabetes) return [];

    const highSugarFoods = await this.prisma.foodNutrition.findMany({
      where: { foodId: { in: context.proposedFoodIds }, sugarG: { gte: SUGAR_WARNING_THRESHOLD_G } },
      include: { food: { select: { name: true } } },
    });

    if (highSugarFoods.length === 0) {
      return [{ ruleName: this.name, passed: true, severity: 'INFO', message: 'No high-sugar items detected for user with diabetes.' }];
    }

    return highSugarFoods.map((f) => ({
      ruleName: this.name,
      passed: true, // WARNING, not a block
      severity: 'WARNING' as const,
      message: `"${f.food.name}" contains ${f.sugarG}g sugar per serving — monitor portion size given active diabetes/gestational diabetes.`,
    }));
  }
}

const HYPERTENSION_NAMES = ['Hypertension'];
const SODIUM_WARNING_THRESHOLD_MG = 400; // per proposed food item

/**
 * HYPERTENSION RULE
 * Flags high-sodium foods as WARNING for users with active hypertension.
 */
@Injectable()
export class HypertensionRule implements MedicalRule {
  readonly name = 'HypertensionRule';

  constructor(private readonly prisma: PrismaClient) {}

  async evaluate(context: MedicalRuleContext): Promise<RuleFinding[]> {
    const hasHypertension = await this.prisma.medicalCondition.findFirst({
      where: {
        userId: context.userId,
        deletedAt: null,
        isActive: true,
        disease: { name: { in: HYPERTENSION_NAMES } },
      },
    });
    if (!hasHypertension) return [];

    const highSodiumFoods = await this.prisma.foodNutrition.findMany({
      where: { foodId: { in: context.proposedFoodIds }, sodiumMg: { gte: SODIUM_WARNING_THRESHOLD_MG } },
      include: { food: { select: { name: true } } },
    });

    if (highSodiumFoods.length === 0) {
      return [{ ruleName: this.name, passed: true, severity: 'INFO', message: 'No high-sodium items detected for user with hypertension.' }];
    }

    return highSodiumFoods.map((f) => ({
      ruleName: this.name,
      passed: true,
      severity: 'WARNING' as const,
      message: `"${f.food.name}" contains ${f.sodiumMg}mg sodium per serving — high relative to hypertension guidance.`,
    }));
  }
}

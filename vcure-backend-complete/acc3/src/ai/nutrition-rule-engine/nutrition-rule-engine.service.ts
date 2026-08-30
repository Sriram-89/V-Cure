import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { PrismaClient, MealType } from '@prisma/client';
import { RuleFinding, RuleEngineResult } from '../types/pipeline.types';
import { AIError } from '../errors/ai.errors';

/**
 * NUTRITION RULE ENGINE — Service
 *
 * Input Schema:  { userId, proposedFoodIds, mealType }
 * Output Schema: { passed, findings }
 *
 * Stage 2b of the pipeline (sibling to Medical Rule Engine — both run after
 * Safety Engine passes). Checks the proposed food set's aggregate calories
 * against a per-meal-type share of the user's `dailyCalorieTarget`
 * (HealthProfile), and flags macro imbalance relative to the user's
 * `primaryGoal` (GoalType). Like Medical Rule Engine, findings here are
 * WARNING/INFO — nutrition fit shapes ranking/explanation, not a hard block.
 */
export const NutritionRuleCheckInputSchema = z.object({
  userId: z.string().uuid(),
  proposedFoodIds: z.array(z.string().uuid()).min(1),
  mealType: z.nativeEnum(MealType),
});
export type NutritionRuleCheckInput = z.infer<typeof NutritionRuleCheckInputSchema>;

// Rough share of daily calories per meal slot — used only for a soft
// "over/under budget" signal, never as a rigid prescription.
const MEAL_TYPE_CALORIE_SHARE: Record<MealType, number> = {
  BREAKFAST: 0.25,
  LUNCH: 0.35,
  DINNER: 0.3,
  SNACK: 0.1,
  BEVERAGE: 0.05,
};

const CALORIE_TOLERANCE_PCT = 0.25; // +/-25% before flagging

@Injectable()
export class NutritionRuleEngineService {
  constructor(private readonly prisma: PrismaClient) {}

  async evaluate(input: NutritionRuleCheckInput): Promise<RuleEngineResult> {
    const parsed = NutritionRuleCheckInputSchema.safeParse(input);
    if (!parsed.success) {
      throw new AIError('INPUT_VALIDATION_FAILED', 'Invalid nutrition rule check input', {
        internalDetail: JSON.stringify(parsed.error.issues),
      });
    }
    const { userId, proposedFoodIds, mealType } = parsed.data;

    const findings: RuleFinding[] = [];

    const healthProfile = await this.prisma.healthProfile.findUnique({ where: { userId } });
    const nutritionRows = await this.prisma.foodNutrition.findMany({
      where: { foodId: { in: proposedFoodIds } },
    });

    if (nutritionRows.length === 0) {
      findings.push({
        ruleName: 'NutritionDataAvailabilityRule',
        passed: true,
        severity: 'WARNING',
        message: 'No nutrition data found for the proposed food(s); calorie/macro checks were skipped.',
      });
      return { passed: true, findings };
    }

    const totals = nutritionRows.reduce(
      (acc, row) => ({
        calories: acc.calories + row.caloriesKcal,
        protein: acc.protein + row.proteinG,
        carbs: acc.carbs + row.carbsG,
        fat: acc.fat + row.fatG,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    findings.push(...this.checkCalorieBudget(totals.calories, mealType, healthProfile?.dailyCalorieTarget ?? null));
    findings.push(...this.checkMacroBalance(totals, healthProfile?.primaryGoal ?? null));

    return { passed: true, findings };
  }

  private checkCalorieBudget(mealCalories: number, mealType: MealType, dailyTarget: number | null): RuleFinding[] {
    if (!dailyTarget) {
      return [
        {
          ruleName: 'CalorieBudgetRule',
          passed: true,
          severity: 'INFO',
          message: 'User has no dailyCalorieTarget set yet — calorie budget check skipped (complete Health Profile to enable).',
        },
      ];
    }

    const expectedShare = dailyTarget * MEAL_TYPE_CALORIE_SHARE[mealType];
    const lowerBound = expectedShare * (1 - CALORIE_TOLERANCE_PCT);
    const upperBound = expectedShare * (1 + CALORIE_TOLERANCE_PCT);

    if (mealCalories > upperBound) {
      return [
        {
          ruleName: 'CalorieBudgetRule',
          passed: true,
          severity: 'WARNING',
          message: `Proposed meal is ${Math.round(mealCalories)} kcal, above the expected ${Math.round(expectedShare)} kcal share for ${mealType.toLowerCase()} given the user's daily target.`,
        },
      ];
    }
    if (mealCalories < lowerBound) {
      return [
        {
          ruleName: 'CalorieBudgetRule',
          passed: true,
          severity: 'INFO',
          message: `Proposed meal is ${Math.round(mealCalories)} kcal, below the expected ${Math.round(expectedShare)} kcal share for ${mealType.toLowerCase()}.`,
        },
      ];
    }
    return [
      {
        ruleName: 'CalorieBudgetRule',
        passed: true,
        severity: 'INFO',
        message: `Proposed meal calories (${Math.round(mealCalories)} kcal) fit within the expected range for ${mealType.toLowerCase()}.`,
      },
    ];
  }

  private checkMacroBalance(
    totals: { calories: number; protein: number; carbs: number; fat: number },
    goal: string | null,
  ): RuleFinding[] {
    if (totals.calories === 0) return [];

    const proteinCalPct = (totals.protein * 4) / totals.calories;
    const findings: RuleFinding[] = [];

    if (goal === 'MUSCLE_GAIN' || goal === 'ATHLETIC_PERFORMANCE') {
      if (proteinCalPct < 0.2) {
        findings.push({
          ruleName: 'MacroBalanceRule',
          passed: true,
          severity: 'WARNING',
          message: `Protein is only ~${Math.round(proteinCalPct * 100)}% of this meal's calories, which is low relative to the user's ${goal.toLowerCase().replace('_', ' ')} goal.`,
        });
      }
    }

    if (goal === 'WEIGHT_LOSS' && totals.calories > 700) {
      findings.push({
        ruleName: 'MacroBalanceRule',
        passed: true,
        severity: 'WARNING',
        message: `This meal is relatively calorie-dense (${Math.round(totals.calories)} kcal) for a weight-loss goal.`,
      });
    }

    if (findings.length === 0) {
      findings.push({
        ruleName: 'MacroBalanceRule',
        passed: true,
        severity: 'INFO',
        message: 'Macro balance is consistent with the user\'s stated goal.',
      });
    }

    return findings;
  }
}

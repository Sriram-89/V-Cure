import { NutritionRuleEngineService } from '../nutrition-rule-engine/nutrition-rule-engine.service';
import { createMockPrisma } from './mocks';

describe('NutritionRuleEngineService', () => {
  it('skips calorie/macro checks gracefully when no nutrition data exists', async () => {
    const prisma = createMockPrisma();
    prisma.foodNutrition.findMany.mockResolvedValue([]);
    const service = new NutritionRuleEngineService(prisma as any);

    const result = await service.evaluate({ userId: 'u1', proposedFoodIds: ['f1'], mealType: 'LUNCH' });

    expect(result.passed).toBe(true);
    expect(result.findings[0].ruleName).toBe('NutritionDataAvailabilityRule');
  });

  it('flags a meal over the expected calorie share as WARNING', async () => {
    const prisma = createMockPrisma();
    prisma.healthProfile.findUnique.mockResolvedValue({ dailyCalorieTarget: 2000, primaryGoal: 'GENERAL_WELLNESS' });
    prisma.foodNutrition.findMany.mockResolvedValue([{ caloriesKcal: 1200, proteinG: 20, carbsG: 100, fatG: 40 }]);

    const service = new NutritionRuleEngineService(prisma as any);
    const result = await service.evaluate({ userId: 'u1', proposedFoodIds: ['f1'], mealType: 'LUNCH' });

    const calorieFinding = result.findings.find((f) => f.ruleName === 'CalorieBudgetRule');
    expect(calorieFinding?.severity).toBe('WARNING');
  });

  it('flags low protein share as WARNING for a muscle-gain goal', async () => {
    const prisma = createMockPrisma();
    prisma.healthProfile.findUnique.mockResolvedValue({ dailyCalorieTarget: 2500, primaryGoal: 'MUSCLE_GAIN' });
    prisma.foodNutrition.findMany.mockResolvedValue([{ caloriesKcal: 500, proteinG: 5, carbsG: 90, fatG: 10 }]);

    const service = new NutritionRuleEngineService(prisma as any);
    const result = await service.evaluate({ userId: 'u1', proposedFoodIds: ['f1'], mealType: 'DINNER' });

    const macroFinding = result.findings.find((f) => f.ruleName === 'MacroBalanceRule');
    expect(macroFinding?.severity).toBe('WARNING');
    expect(macroFinding?.message).toContain('muscle gain');
  });

  it('never returns passed=false — this engine only produces guidance, not blocks', async () => {
    const prisma = createMockPrisma();
    prisma.healthProfile.findUnique.mockResolvedValue({ dailyCalorieTarget: 1200, primaryGoal: 'WEIGHT_LOSS' });
    prisma.foodNutrition.findMany.mockResolvedValue([{ caloriesKcal: 900, proteinG: 10, carbsG: 100, fatG: 40 }]);

    const service = new NutritionRuleEngineService(prisma as any);
    const result = await service.evaluate({ userId: 'u1', proposedFoodIds: ['f1'], mealType: 'DINNER' });

    expect(result.passed).toBe(true);
  });

  it('rejects an invalid mealType at the schema boundary', async () => {
    const prisma = createMockPrisma();
    const service = new NutritionRuleEngineService(prisma as any);
    await expect(
      service.evaluate({ userId: 'u1', proposedFoodIds: ['f1'], mealType: 'NOT_A_MEAL' } as any),
    ).rejects.toThrow();
  });
});

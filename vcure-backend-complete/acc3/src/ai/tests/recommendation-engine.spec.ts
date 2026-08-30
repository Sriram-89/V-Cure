import { RecommendationEngineFoundationService } from '../recommendation-engine/recommendation-engine-foundation.service';
import { SafetyEngineService } from '../safety-engine/safety-engine.service';
import { MedicalRuleEngineService } from '../medical-rule-engine/medical-rule-engine.service';
import { NutritionRuleEngineService } from '../nutrition-rule-engine/nutrition-rule-engine.service';
import { ValidationLayerService } from '../common/pipeline/validation-layer.service';
import { ResponseFormatterService } from '../common/pipeline/response-formatter.service';
import { PromptBuilderService } from '../prompt-builder/prompt-builder.service';
import { PromptTemplateService } from '../prompt-templates/prompt-template.service';
import { AIProviderFactory } from '../providers/provider.factory';
import { ExplainabilityEngineService } from '../explainability-engine/explainability-engine.service';
import { createMockPrisma, createMockAIProvider } from './mocks';

const USER_ID = '11111111-1111-1111-1111-111111111111';
const MEAL_ID = '22222222-2222-2222-2222-222222222222';
const FOOD_ID = '33333333-3333-3333-3333-333333333333';

function buildValidMealJson() {
  return JSON.stringify({
    recipeId: null,
    mealType: 'LUNCH',
    title: 'Grilled Chicken Salad',
    reasons: [{ reasonText: 'High protein, low glycemic load, fits calorie budget.', nutrientFocus: 'Protein' }],
    estimatedCalories: 450,
    alternatives: [{ title: 'Quinoa Bowl', reason: 'Vegetarian alternative with similar protein.' }],
  });
}

function buildHarness(opts: { completionContent?: string; providerThrows?: boolean } = {}) {
  const prisma = createMockPrisma();
  prisma.food.findMany.mockResolvedValue([{ id: FOOD_ID, name: 'Grilled Chicken' }]);

  const safetyEngine = { check: jest.fn() } as unknown as SafetyEngineService;
  const medicalRuleEngine = { evaluate: jest.fn() } as unknown as MedicalRuleEngineService;
  const nutritionRuleEngine = { evaluate: jest.fn() } as unknown as NutritionRuleEngineService;
  const validationLayer = new ValidationLayerService();
  const formatter = new ResponseFormatterService();
  const promptBuilder = new PromptBuilderService(new PromptTemplateService(prisma as any));

  const mockProvider = createMockAIProvider({
    name: 'OPENAI_COMPATIBLE',
    complete: opts.providerThrows
      ? jest.fn().mockRejectedValue(new Error('provider down'))
      : jest.fn().mockResolvedValue({ content: opts.completionContent ?? buildValidMealJson(), finishReason: 'stop', latencyMs: 5 }),
  });
  const providerFactory = {
    resolveForPurpose: jest.fn().mockResolvedValue({ provider: mockProvider, modelName: 'test-model', temperature: 0.4, maxTokens: 1024 }),
  } as unknown as AIProviderFactory;

  const explainabilityEngine = { explain: jest.fn().mockResolvedValue({ explanation: 'Because of X', keyNutrients: ['Protein'], mealReasonIds: ['r1'] }) } as unknown as ExplainabilityEngineService;

  const service = new RecommendationEngineFoundationService(
    prisma as any,
    safetyEngine,
    medicalRuleEngine,
    nutritionRuleEngine,
    validationLayer,
    formatter,
    promptBuilder,
    providerFactory,
    explainabilityEngine,
  );

  return { service, prisma, safetyEngine, medicalRuleEngine, nutritionRuleEngine, mockProvider, explainabilityEngine };
}

describe('RecommendationEngineFoundationService — full pipeline order', () => {
  it('runs Safety -> Rule -> Validation -> Formatter and returns success when everything passes', async () => {
    const { service, safetyEngine, medicalRuleEngine, nutritionRuleEngine, prisma } = buildHarness();

    (safetyEngine.check as jest.Mock).mockResolvedValue({ result: 'PASSED', safetyValidationId: 'sv-1', ruleOutcomes: [] });
    (medicalRuleEngine.evaluate as jest.Mock).mockResolvedValue({ passed: true, findings: [] });
    (nutritionRuleEngine.evaluate as jest.Mock).mockResolvedValue({ passed: true, findings: [] });

    const result = await service.generate({ userId: USER_ID, mealId: MEAL_ID, mealType: 'LUNCH', candidateFoodIds: [FOOD_ID] });

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe('Grilled Chicken Salad');
    expect(result.trace.stages.map((s) => s.stage)).toEqual(['SAFETY', 'RULE', 'VALIDATION']);
    expect(safetyEngine.check).toHaveBeenCalledTimes(1);
    expect(medicalRuleEngine.evaluate).toHaveBeenCalledTimes(1);
    expect(nutritionRuleEngine.evaluate).toHaveBeenCalledTimes(1);
    expect(prisma.recommendationLog.create).toHaveBeenCalledTimes(1);
  });

  it('stops at Safety and never calls Rule Engine or the AI provider when Safety blocks', async () => {
    const { service, safetyEngine, medicalRuleEngine, mockProvider, prisma } = buildHarness();

    (safetyEngine.check as jest.Mock).mockResolvedValue({
      result: 'BLOCKED_ALLERGY',
      blockedReason: 'Conflicts with peanut allergy',
      safetyValidationId: 'sv-2',
      ruleOutcomes: [],
    });

    const result = await service.generate({ userId: USER_ID, mealId: MEAL_ID, mealType: 'LUNCH', candidateFoodIds: [FOOD_ID] });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('SAFETY_BLOCKED');
    expect(medicalRuleEngine.evaluate).not.toHaveBeenCalled();
    expect(mockProvider.complete).not.toHaveBeenCalled();
    expect(prisma.recommendationLog.create).toHaveBeenCalledTimes(1); // still logged
  });

  it('stops at Rule Engine and never calls the AI provider when a rule engine rejects', async () => {
    const { service, safetyEngine, medicalRuleEngine, nutritionRuleEngine, mockProvider } = buildHarness();

    (safetyEngine.check as jest.Mock).mockResolvedValue({ result: 'PASSED', safetyValidationId: 'sv-1', ruleOutcomes: [] });
    (medicalRuleEngine.evaluate as jest.Mock).mockResolvedValue({ passed: false, findings: [] });
    (nutritionRuleEngine.evaluate as jest.Mock).mockResolvedValue({ passed: true, findings: [] });

    const result = await service.generate({ userId: USER_ID, mealId: MEAL_ID, mealType: 'LUNCH', candidateFoodIds: [FOOD_ID] });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('RULE_ENGINE_REJECTED');
    expect(mockProvider.complete).not.toHaveBeenCalled();
  });

  it('fails cleanly at Validation when the provider returns malformed JSON, without throwing past the caller', async () => {
    const { service, safetyEngine, medicalRuleEngine, nutritionRuleEngine } = buildHarness({ completionContent: 'not json' });

    (safetyEngine.check as jest.Mock).mockResolvedValue({ result: 'PASSED', safetyValidationId: 'sv-1', ruleOutcomes: [] });
    (medicalRuleEngine.evaluate as jest.Mock).mockResolvedValue({ passed: true, findings: [] });
    (nutritionRuleEngine.evaluate as jest.Mock).mockResolvedValue({ passed: true, findings: [] });

    const result = await service.generate({ userId: USER_ID, mealId: MEAL_ID, mealType: 'LUNCH', candidateFoodIds: [FOOD_ID] });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('OUTPUT_VALIDATION_FAILED');
  });

  it('handles a provider failure gracefully (PIPELINE_STAGE_FAILED), not an unhandled rejection', async () => {
    const { service, safetyEngine, medicalRuleEngine, nutritionRuleEngine } = buildHarness({ providerThrows: true });

    (safetyEngine.check as jest.Mock).mockResolvedValue({ result: 'PASSED', safetyValidationId: 'sv-1', ruleOutcomes: [] });
    (medicalRuleEngine.evaluate as jest.Mock).mockResolvedValue({ passed: true, findings: [] });
    (nutritionRuleEngine.evaluate as jest.Mock).mockResolvedValue({ passed: true, findings: [] });

    const result = await service.generate({ userId: USER_ID, mealId: MEAL_ID, mealType: 'LUNCH', candidateFoodIds: [FOOD_ID] });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('PIPELINE_STAGE_FAILED');
  });

  it('does not fail the whole recommendation when Explainability Engine fails (best-effort enhancement only)', async () => {
    const { service, safetyEngine, medicalRuleEngine, nutritionRuleEngine, explainabilityEngine } = buildHarness();

    (safetyEngine.check as jest.Mock).mockResolvedValue({ result: 'PASSED', safetyValidationId: 'sv-1', ruleOutcomes: [] });
    (medicalRuleEngine.evaluate as jest.Mock).mockResolvedValue({ passed: true, findings: [] });
    (nutritionRuleEngine.evaluate as jest.Mock).mockResolvedValue({ passed: true, findings: [] });
    (explainabilityEngine.explain as jest.Mock).mockRejectedValue(new Error('explainability down'));

    const result = await service.generate({ userId: USER_ID, mealId: MEAL_ID, mealType: 'LUNCH', candidateFoodIds: [FOOD_ID] });

    expect(result.success).toBe(true);
    expect(result.data?.explanation).toBeUndefined();
    expect(result.data?.reasons.length).toBeGreaterThan(0); // Sec. 50 baseline still satisfied via reasons
  });

  it('rejects invalid input at the schema boundary before touching any engine', async () => {
    const { service, safetyEngine } = buildHarness();
    const result = await service.generate({ userId: 'not-a-uuid', mealId: 'bad', mealType: 'LUNCH', candidateFoodIds: [] } as any);
    expect(result.success).toBe(false);
    expect(safetyEngine.check).not.toHaveBeenCalled();
  });
});

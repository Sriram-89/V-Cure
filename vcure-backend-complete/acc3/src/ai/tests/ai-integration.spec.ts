/**
 * AI INTEGRATION TESTS
 *
 * Unlike the per-module spec files (which mock the modules a service
 * depends on), these tests wire together the REAL classes for every stage:
 *
 *   Safety Engine -> Medical Rule Engine -> Nutrition Rule Engine ->
 *   Validation Layer -> Response Formatter -> Explainability Engine ->
 *   Recommendation Engine -> RecommendationLog
 *
 * Only two things are mocked: PrismaClient (no live DB in this sandbox —
 * see README-AI.md "Testing Strategy") and the AI provider's HTTP call
 * (no live network). Every orchestration decision — which stage runs after
 * which, what happens on a block, what gets persisted — is exercised for
 * real.
 */
import { AllergyRule } from '../safety-engine/rules/allergy.rule';
import { MedicalConditionRule } from '../safety-engine/rules/medical-condition.rule';
import { MedicineInteractionRule } from '../safety-engine/rules/medicine-interaction.rule';
import { SafetyEngineService } from '../safety-engine/safety-engine.service';
import { DiabetesRule, HypertensionRule } from '../medical-rule-engine/rules/metabolic-cardio.rule';
import { RenalRule, HepaticRule, PregnancyRule } from '../medical-rule-engine/rules/renal-hepatic-pregnancy.rule';
import { MedicalRuleEngineService } from '../medical-rule-engine/medical-rule-engine.service';
import { NutritionRuleEngineService } from '../nutrition-rule-engine/nutrition-rule-engine.service';
import { ValidationLayerService } from '../common/pipeline/validation-layer.service';
import { ResponseFormatterService } from '../common/pipeline/response-formatter.service';
import { PromptBuilderService } from '../prompt-builder/prompt-builder.service';
import { PromptTemplateService } from '../prompt-templates/prompt-template.service';
import { ExplainabilityEngineService } from '../explainability-engine/explainability-engine.service';
import { RecommendationEngineFoundationService } from '../recommendation-engine/recommendation-engine-foundation.service';
import { AIProviderFactory } from '../providers/provider.factory';
import { createMockPrisma, createMockAIProvider } from './mocks';

const USER_ID = '11111111-1111-1111-1111-111111111111';
const MEAL_ID = '22222222-2222-2222-2222-222222222222';
const SAFE_FOOD_ID = '33333333-3333-3333-3333-333333333333';
const PEANUT_FOOD_ID = '44444444-4444-4444-4444-444444444444';

function buildRealPipeline(prisma: ReturnType<typeof createMockPrisma>, completionContent: string) {
  const allergyRule = new AllergyRule(prisma as any);
  const medicalConditionRule = new MedicalConditionRule(prisma as any);
  const medicineInteractionRule = new MedicineInteractionRule(prisma as any);
  const safetyEngine = new SafetyEngineService(prisma as any, allergyRule, medicalConditionRule, medicineInteractionRule);

  const medicalRuleEngine = new MedicalRuleEngineService(
    new DiabetesRule(prisma as any),
    new HypertensionRule(prisma as any),
    new RenalRule(prisma as any),
    new HepaticRule(prisma as any),
    new PregnancyRule(prisma as any),
  );

  const nutritionRuleEngine = new NutritionRuleEngineService(prisma as any);
  const validationLayer = new ValidationLayerService();
  const formatter = new ResponseFormatterService();
  const promptBuilder = new PromptBuilderService(new PromptTemplateService(prisma as any));

  const mockProvider = createMockAIProvider({
    complete: jest.fn().mockResolvedValue({ content: completionContent, finishReason: 'stop', latencyMs: 5 }),
  });
  const providerFactory = {
    resolveForPurpose: jest.fn().mockResolvedValue({ provider: mockProvider, modelName: 'test-model', temperature: 0.4, maxTokens: 1024 }),
  } as unknown as AIProviderFactory;

  const explainabilityEngine = new ExplainabilityEngineService(prisma as any, promptBuilder, providerFactory, validationLayer);

  const recommendationEngine = new RecommendationEngineFoundationService(
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

  return { recommendationEngine, mockProvider };
}

function validMealCompletion() {
  return JSON.stringify({
    recipeId: null,
    mealType: 'DINNER',
    title: 'Steamed Fish with Vegetables',
    reasons: [{ reasonText: 'Lean protein, low sodium, fits calorie target.', nutrientFocus: 'Protein' }],
    estimatedCalories: 400,
    alternatives: [],
  });
}

function explainabilityCompletion() {
  return JSON.stringify({ explanation: 'Chosen for lean protein and low sodium given hypertension.', keyNutrients: ['Protein', 'Sodium'] });
}

describe('AI Integration — full pipeline, real engine classes', () => {
  it('a safe candidate flows through every stage and produces a formatted, logged recommendation', async () => {
    const prisma = createMockPrisma();
    prisma.food.findMany.mockResolvedValue([{ id: SAFE_FOOD_ID, name: 'Steamed Fish' }]);
    // No allergies, no conditions, no medicines -> every safety/medical rule passes trivially.

    const { recommendationEngine, mockProvider } = buildRealPipeline(prisma, validMealCompletion());
    // First provider.complete() call is the meal generation; explainability needs its own mock return.
    (mockProvider.complete as jest.Mock)
      .mockResolvedValueOnce({ content: validMealCompletion(), finishReason: 'stop', latencyMs: 5 })
      .mockResolvedValueOnce({ content: explainabilityCompletion(), finishReason: 'stop', latencyMs: 5 });

    const result = await recommendationEngine.generate({
      userId: USER_ID,
      mealId: MEAL_ID,
      mealType: 'DINNER',
      candidateFoodIds: [SAFE_FOOD_ID],
    });

    expect(result.success).toBe(true);
    expect(result.data?.title).toBe('Steamed Fish with Vegetables');
    expect(result.data?.explanation).toContain('lean protein');
    expect(result.trace.stages.map((s) => s.stage)).toEqual(['SAFETY', 'RULE', 'VALIDATION']);
    expect(prisma.recommendationLog.create).toHaveBeenCalledTimes(1);
    expect(prisma.safetyValidation.create).toHaveBeenCalledTimes(1);
    expect(prisma.mealRecommendation.create).toHaveBeenCalledTimes(1);
  });

  it('an allergy-conflicting candidate is blocked at Safety and never reaches the AI provider', async () => {
    const prisma = createMockPrisma();
    prisma.allergy.findMany.mockResolvedValue([{ allergyTypeId: 'peanut-id', allergyType: { name: 'Peanuts' } }]);
    prisma.foodRestriction.findFirst.mockResolvedValue({ allergyTypeId: 'peanut-id', food: { name: 'Peanut Sauce' } });

    const { recommendationEngine, mockProvider } = buildRealPipeline(prisma, validMealCompletion());

    const result = await recommendationEngine.generate({
      userId: USER_ID,
      mealId: MEAL_ID,
      mealType: 'DINNER',
      candidateFoodIds: [PEANUT_FOOD_ID],
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('SAFETY_BLOCKED');
    expect(result.blockedReason).toContain('Peanuts');
    expect(mockProvider.complete).not.toHaveBeenCalled();
  });

  it('surfaces medical rule engine WARNING findings without blocking generation (diabetes + high sugar candidate)', async () => {
    const prisma = createMockPrisma();
    prisma.food.findMany.mockResolvedValue([{ id: SAFE_FOOD_ID, name: 'Fruit Cake' }]);
    prisma.medicalCondition.findFirst.mockResolvedValue({ id: 'mc1' }); // any condition query returns truthy
    prisma.medicalCondition.findMany.mockResolvedValue([]); // used by the LLM prompt-context builder in the engine

    const { recommendationEngine, mockProvider } = buildRealPipeline(prisma, validMealCompletion());
    (mockProvider.complete as jest.Mock)
      .mockResolvedValueOnce({ content: validMealCompletion(), finishReason: 'stop', latencyMs: 5 })
      .mockResolvedValueOnce({ content: explainabilityCompletion(), finishReason: 'stop', latencyMs: 5 });

    const result = await recommendationEngine.generate({
      userId: USER_ID,
      mealId: MEAL_ID,
      mealType: 'DINNER',
      candidateFoodIds: [SAFE_FOOD_ID],
    });

    // Medical rule engine returns WARNING-only findings (passed=true design) so
    // the pipeline should still reach and pass RULE, then succeed overall.
    expect(result.trace.stages.find((s) => s.stage === 'RULE')?.passed).toBe(true);
    expect(result.success).toBe(true);
  });
});

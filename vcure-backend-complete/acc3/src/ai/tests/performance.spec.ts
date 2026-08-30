/**
 * PERFORMANCE TESTS
 *
 * IMPORTANT SCOPE NOTE: this sandbox has no outbound network access (see
 * README-AI.md and the Phase 1 DB-layer README for the same constraint), so
 * these tests cannot measure real OpenAI/Gemini/vector-DB network latency —
 * doing so would require live API calls this environment cannot make. What
 * they DO measure and assert is honest and useful:
 *
 * 1. Orchestration overhead — how much time the pipeline itself adds on top
 *    of a provider call (JSON validation, DB writes, stage bookkeeping).
 *    This is the part V-Cure's own code controls and can regress.
 * 2. Chunking/embedding-request-shaping performance for large documents.
 * 3. Vector search (in-memory) query performance at a representative corpus
 *    size, since the in-memory store's cosine-similarity scan IS real code
 *    that runs in this sandbox (no network involved).
 *
 * Results are logged to console and asserted against generous upper bounds
 * (regression guards, not SLA claims) — see docs/PERFORMANCE_BENCHMARKS.md
 * for how to read these numbers and what would need a live environment to
 * measure instead.
 */
import { chunkText } from '../embedding-pipeline/chunker';
import { InMemoryVectorStoreProvider } from '../vector-search/providers/in-memory-vector-store.provider';
import { ValidationLayerService } from '../common/pipeline/validation-layer.service';
import { RecommendationEngineFoundationService } from '../recommendation-engine/recommendation-engine-foundation.service';
import { SafetyEngineService } from '../safety-engine/safety-engine.service';
import { AllergyRule } from '../safety-engine/rules/allergy.rule';
import { MedicalConditionRule } from '../safety-engine/rules/medical-condition.rule';
import { MedicineInteractionRule } from '../safety-engine/rules/medicine-interaction.rule';
import { MedicalRuleEngineService } from '../medical-rule-engine/medical-rule-engine.service';
import { DiabetesRule, HypertensionRule } from '../medical-rule-engine/rules/metabolic-cardio.rule';
import { RenalRule, HepaticRule, PregnancyRule } from '../medical-rule-engine/rules/renal-hepatic-pregnancy.rule';
import { NutritionRuleEngineService } from '../nutrition-rule-engine/nutrition-rule-engine.service';
import { ResponseFormatterService } from '../common/pipeline/response-formatter.service';
import { PromptBuilderService } from '../prompt-builder/prompt-builder.service';
import { PromptTemplateService } from '../prompt-templates/prompt-template.service';
import { ExplainabilityEngineService } from '../explainability-engine/explainability-engine.service';
import { AIProviderFactory } from '../providers/provider.factory';
import { createMockPrisma, createMockAIProvider } from './mocks';

const results: Record<string, number> = {};
afterAll(() => {
  // eslint-disable-next-line no-console
  console.log('\n=== AI Foundation Performance Results (orchestration overhead, mocked I/O) ===');
  // eslint-disable-next-line no-console
  console.table(results);
});

describe('Performance — Embedding chunker', () => {
  it('chunks a large (50k word) document in well under 200ms', () => {
    const bigDoc = Array.from({ length: 50_000 }, (_, i) => `word${i % 500}`).join(' ');
    const start = performance.now();
    const chunks = chunkText(bigDoc, 512, 64);
    const elapsed = performance.now() - start;
    results['chunker_50k_words_ms'] = Math.round(elapsed * 100) / 100;

    expect(chunks.length).toBeGreaterThan(1);
    expect(elapsed).toBeLessThan(200);
  });
});

describe('Performance — In-memory vector search at representative corpus size', () => {
  it('queries a 2,000-vector in-memory index in well under 100ms', async () => {
    const store = new InMemoryVectorStoreProvider();
    const dims = 128;
    const vectors = Array.from({ length: 2000 }, (_, i) => ({
      id: `v${i}`,
      vector: Array.from({ length: dims }, () => Math.random()),
      metadata: { knowledgeArticleId: `a${i}`, chunkIndex: 0, chunkText: `chunk ${i}` },
    }));
    await store.upsert(vectors);

    const queryVector = Array.from({ length: dims }, () => Math.random());
    const start = performance.now();
    const matches = await store.query(queryVector, 5, 0);
    const elapsed = performance.now() - start;
    results['vector_search_2000_items_ms'] = Math.round(elapsed * 100) / 100;

    expect(matches).toHaveLength(5);
    expect(elapsed).toBeLessThan(100);
  });
});

describe('Performance — Validation Layer throughput', () => {
  it('validates 1,000 meal-recommendation payloads in well under 500ms', () => {
    const service = new ValidationLayerService();
    const payload = JSON.stringify({
      recipeId: null,
      mealType: 'LUNCH',
      title: 'Test Meal',
      reasons: [{ reasonText: 'reason', nutrientFocus: null }],
      estimatedCalories: 400,
      alternatives: [],
    });

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      service.validate('meal_recommendation_v1', payload);
    }
    const elapsed = performance.now() - start;
    results['validate_1000_payloads_ms'] = Math.round(elapsed * 100) / 100;

    expect(elapsed).toBeLessThan(500);
  });
});

describe('Performance — Recommendation Engine orchestration overhead', () => {
  it('completes a full successful pipeline run (mocked provider, ~5ms simulated latency) in well under 150ms of orchestration overhead', async () => {
    const prisma = createMockPrisma();
    const foodId = '33333333-3333-3333-3333-333333333333';
    prisma.food.findMany.mockResolvedValue([{ id: foodId, name: 'Test Food' }]);

    const safetyEngine = new SafetyEngineService(
      prisma as any,
      new AllergyRule(prisma as any),
      new MedicalConditionRule(prisma as any),
      new MedicineInteractionRule(prisma as any),
    );
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

    const mealJson = JSON.stringify({
      recipeId: null,
      mealType: 'LUNCH',
      title: 'Perf Test Meal',
      reasons: [{ reasonText: 'fast reason', nutrientFocus: null }],
      estimatedCalories: 400,
      alternatives: [],
    });
    const explainJson = JSON.stringify({ explanation: 'fast explanation', keyNutrients: [] });

    const mockProvider = createMockAIProvider({
      complete: jest
        .fn()
        .mockResolvedValueOnce({ content: mealJson, finishReason: 'stop', latencyMs: 5 })
        .mockResolvedValueOnce({ content: explainJson, finishReason: 'stop', latencyMs: 5 }),
    });
    const providerFactory = {
      resolveForPurpose: jest.fn().mockResolvedValue({ provider: mockProvider, modelName: 'test-model', temperature: 0.4, maxTokens: 1024 }),
    } as unknown as AIProviderFactory;
    const explainabilityEngine = new ExplainabilityEngineService(prisma as any, promptBuilder, providerFactory, validationLayer);

    const engine = new RecommendationEngineFoundationService(
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

    const start = performance.now();
    const result = await engine.generate({
      userId: '11111111-1111-1111-1111-111111111111',
      mealId: '22222222-2222-2222-2222-222222222222',
      mealType: 'LUNCH',
      candidateFoodIds: [foodId],
    });
    const elapsed = performance.now() - start;
    results['recommendation_pipeline_mocked_provider_ms'] = Math.round(elapsed * 100) / 100;

    expect(result.success).toBe(true);
    expect(elapsed).toBeLessThan(150);
  });
});

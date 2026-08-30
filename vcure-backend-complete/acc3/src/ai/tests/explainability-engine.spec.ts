import { ExplainabilityEngineService } from '../explainability-engine/explainability-engine.service';
import { PromptBuilderService } from '../prompt-builder/prompt-builder.service';
import { PromptTemplateService } from '../prompt-templates/prompt-template.service';
import { AIProviderFactory } from '../providers/provider.factory';
import { ValidationLayerService } from '../common/pipeline/validation-layer.service';
import { createMockPrisma, createMockAIProvider } from './mocks';

describe('ExplainabilityEngineService', () => {
  function buildService(completionContent: string) {
    const prisma = createMockPrisma();
    const promptBuilder = new PromptBuilderService(new PromptTemplateService(prisma as any));
    const mockProvider = createMockAIProvider({
      complete: jest.fn().mockResolvedValue({ content: completionContent, finishReason: 'stop', latencyMs: 5 }),
    });
    const providerFactory = {
      resolveForPurpose: jest.fn().mockResolvedValue({
        provider: mockProvider,
        modelName: 'test-model',
        temperature: 0.3,
        maxTokens: 512,
      }),
    } as unknown as AIProviderFactory;
    const validationLayer = new ValidationLayerService();

    const service = new ExplainabilityEngineService(prisma as any, promptBuilder, providerFactory, validationLayer);
    return { service, prisma, mockProvider };
  }

  it('produces an explanation and persists a MealReason row', async () => {
    const { service, prisma } = buildService(
      JSON.stringify({ explanation: 'Chosen for high fiber and low glycemic impact.', keyNutrients: ['Fiber', 'Complex Carbs'] }),
    );

    const result = await service.explain({
      mealId: '11111111-1111-1111-1111-111111111111',
      mealRecommendationId: '22222222-2222-2222-2222-222222222222',
      recommendationPayload: { title: 'Oatmeal' },
    });

    expect(result.explanation).toContain('fiber');
    expect(result.keyNutrients).toEqual(['Fiber', 'Complex Carbs']);
    expect(result.mealReasonIds).toHaveLength(1);
    expect(prisma.mealReason.create).toHaveBeenCalledTimes(1);
  });

  it('never says "because I think so" — schema requires a substantive explanation string', async () => {
    const { service } = buildService(JSON.stringify({ explanation: '', keyNutrients: [] }));
    // empty explanation fails ExplainabilityOutputSchema's min(1) constraint
    await expect(
      service.explain({
        mealId: '11111111-1111-1111-1111-111111111111',
        mealRecommendationId: '22222222-2222-2222-2222-222222222222',
        recommendationPayload: {},
      }),
    ).rejects.toThrow();
  });

  it('rejects invalid input at the schema boundary', async () => {
    const { service } = buildService(JSON.stringify({ explanation: 'x', keyNutrients: [] }));
    await expect(
      service.explain({ mealId: 'not-a-uuid', mealRecommendationId: 'also-not-a-uuid', recommendationPayload: {} } as any),
    ).rejects.toThrow();
  });
});

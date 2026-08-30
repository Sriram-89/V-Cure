import { PromptTemplateService } from '../prompt-templates/prompt-template.service';
import { PromptBuilderService } from '../prompt-builder/prompt-builder.service';
import { AIError } from '../errors/ai.errors';
import { createMockPrisma } from './mocks';

describe('PromptTemplateService', () => {
  it('loads the active template from the DB when available', async () => {
    const prisma = createMockPrisma();
    prisma.promptTemplate.findFirst.mockResolvedValue({
      name: 'explainability_v1',
      category: 'EXPLAINABILITY',
      version: 2,
      templateBody: '[SYSTEM]\nYou explain things.\n[USER]\nExplain: {{recommendationPayload}}',
      variables: ['recommendationPayload'],
    });

    const service = new PromptTemplateService(prisma as any);
    const template = await service.getActiveTemplate('explainability_v1');

    expect(template.source).toBe('DATABASE');
    expect(template.version).toBe(2);
    expect(template.system).toBe('You explain things.');
    expect(template.userTemplate).toBe('Explain: {{recommendationPayload}}');
  });

  it('falls back to the bundled template when the DB is unreachable', async () => {
    const prisma = createMockPrisma();
    prisma.promptTemplate.findFirst.mockRejectedValue(new Error('connection refused'));

    const service = new PromptTemplateService(prisma as any);
    const template = await service.getActiveTemplate('meal_recommendation_v1');

    expect(template.source).toBe('BUNDLED_FALLBACK');
    expect(template.variables).toContain('mealType');
  });

  it('falls back to bundled when the DB has no active row for that name', async () => {
    const prisma = createMockPrisma();
    prisma.promptTemplate.findFirst.mockResolvedValue(null);

    const service = new PromptTemplateService(prisma as any);
    const template = await service.getActiveTemplate('safety_validation_v1');
    expect(template.source).toBe('BUNDLED_FALLBACK');
  });

  it('throws AIError for a name that exists in neither DB nor bundled fallback', async () => {
    const prisma = createMockPrisma();
    prisma.promptTemplate.findFirst.mockResolvedValue(null);
    const service = new PromptTemplateService(prisma as any);
    await expect(service.getActiveTemplate('totally_unknown_template')).rejects.toThrow(AIError);
  });
});

describe('PromptBuilderService', () => {
  function buildService(prismaOverrides: Partial<ReturnType<typeof createMockPrisma>> = {}) {
    const prisma = { ...createMockPrisma(), ...prismaOverrides };
    const templateService = new PromptTemplateService(prisma as any);
    return new PromptBuilderService(templateService);
  }

  it('renders variables into the user template and includes the system message', async () => {
    const service = buildService();
    const result = await service.build({
      templateName: 'explainability_v1',
      variables: { recommendationPayload: '{"title":"Oatmeal"}' },
    });

    expect(result.messages[0].role).toBe('system');
    expect(result.messages[1].role).toBe('user');
    expect(result.messages[1].content).toContain('{"title":"Oatmeal"}');
    expect(result.category).toBe('EXPLAINABILITY');
  });

  it('throws when a required variable is missing', async () => {
    const service = buildService();
    await expect(
      service.build({ templateName: 'explainability_v1', variables: {} }),
    ).rejects.toThrow(AIError);
  });

  it('throws when an unexpected variable is supplied (catches integration typos)', async () => {
    const service = buildService();
    await expect(
      service.build({
        templateName: 'explainability_v1',
        variables: { recommendationPayload: '{}', typoVariable: 'oops' },
      }),
    ).rejects.toThrow(AIError);
  });

  it('never leaves a {{variable}} placeholder unrendered in the final prompt', async () => {
    const service = buildService();
    const result = await service.build({
      templateName: 'meal_recommendation_v1',
      variables: {
        mealType: 'LUNCH',
        healthProfile: '{}',
        medicalProfile: '[]',
        lifestyleProfile: '{}',
        nutritionHistory: '[]',
        safetyValidation: '{"result":"PASSED"}',
        candidateOptions: '[]',
      },
    });
    const fullText = result.messages.map((m) => m.content).join('\n');
    expect(fullText).not.toMatch(/\{\{\w+\}\}/);
  });
});

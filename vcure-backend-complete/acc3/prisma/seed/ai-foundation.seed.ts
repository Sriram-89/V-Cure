import { PrismaClient, AIProvider } from '@prisma/client';
import { ALL_PROMPT_TEMPLATES } from '../../src/ai/prompt-templates/content';

/**
 * AI Foundation seed — Sec. "WHEN IMPLEMENTING FEATURES" requires Prompt
 * Templates to exist as reusable, DB-managed, never-hardcoded records.
 *
 * The template bodies themselves live in
 * src/ai/prompt-templates/content/*.ts — this file only projects that single
 * source of truth into the database so PromptTemplateService can load by
 * name/version, and so there is exactly one place (not two) that defines
 * what a template says.
 */
export async function seedPromptTemplates(prisma: PrismaClient) {
  for (const t of ALL_PROMPT_TEMPLATES) {
    const existing = await prisma.promptTemplate.findUnique({ where: { name: t.name } });
    // system+user are combined into templateBody with a delimiter the
    // PromptBuilderService knows how to split; see prompt-builder.service.ts.
    const templateBody = `[SYSTEM]\n${t.system}\n[USER]\n${t.userTemplate}`;

    if (!existing) {
      await prisma.promptTemplate.create({
        data: {
          name: t.name,
          category: t.category,
          templateBody,
          variables: t.variables,
          version: t.version,
          isActive: true,
        },
      });
    } else if (existing.templateBody !== templateBody || existing.version !== t.version) {
      // Sec. "PromptHistory" — every template change is versioned, never silently overwritten.
      await prisma.$transaction([
        prisma.promptHistory.create({
          data: {
            promptTemplateId: existing.id,
            previousBody: existing.templateBody,
            changeReason: 'Reseeded from canonical template source (src/ai/prompt-templates/content)',
          },
        }),
        prisma.promptTemplate.update({
          where: { id: existing.id },
          data: { templateBody, version: t.version, variables: t.variables },
        }),
      ]);
    }
  }
  console.log(`Seeded ${ALL_PROMPT_TEMPLATES.length} prompt templates from canonical source.`);
}

export async function seedModelConfigurations(prisma: PrismaClient) {
  const configs: {
    provider: AIProvider;
    modelName: string;
    purpose: string;
    isDefault: boolean;
    temperature: number;
    maxTokens: number;
  }[] = [
    { provider: 'OPENAI_COMPATIBLE', modelName: 'gpt-4o-mini', purpose: 'chat', isDefault: true, temperature: 0.3, maxTokens: 1024 },
    { provider: 'OPENAI_COMPATIBLE', modelName: 'text-embedding-3-large', purpose: 'embedding', isDefault: true, temperature: 0, maxTokens: 0 },
    { provider: 'GEMINI', modelName: 'gemini-1.5-flash', purpose: 'ocr_extraction', isDefault: true, temperature: 0.1, maxTokens: 2048 },
    { provider: 'OPENAI_COMPATIBLE', modelName: 'gpt-4o-mini', purpose: 'meal_recommendation', isDefault: true, temperature: 0.4, maxTokens: 1024 },
    { provider: 'OPENAI_COMPATIBLE', modelName: 'gpt-4o-mini', purpose: 'explainability', isDefault: true, temperature: 0.3, maxTokens: 512 },
    { provider: 'OPENAI_COMPATIBLE', modelName: 'gpt-4o-mini', purpose: 'lifestyle_recommendation', isDefault: true, temperature: 0.4, maxTokens: 512 },
    { provider: 'OPENAI_COMPATIBLE', modelName: 'gpt-4o-mini', purpose: 'health_assessment', isDefault: true, temperature: 0.2, maxTokens: 512 },
    { provider: 'OPENAI_COMPATIBLE', modelName: 'gpt-4o-mini', purpose: 'risk_analysis', isDefault: true, temperature: 0.2, maxTokens: 768 },
    { provider: 'OPENAI_COMPATIBLE', modelName: 'gpt-4o-mini', purpose: 'safety_validation', isDefault: true, temperature: 0.0, maxTokens: 256 },
  ];

  for (const c of configs) {
    await prisma.modelConfiguration.upsert({
      where: { provider_modelName_purpose: { provider: c.provider, modelName: c.modelName, purpose: c.purpose } },
      update: { isDefault: c.isDefault, temperature: c.temperature, maxTokens: c.maxTokens },
      create: c,
    });
  }
  console.log(`Seeded ${configs.length} model configurations.`);
}

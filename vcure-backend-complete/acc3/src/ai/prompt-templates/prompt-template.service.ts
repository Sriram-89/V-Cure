import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PROMPT_TEMPLATES_BY_NAME, PromptTemplateDefinition } from './content';
import { AIError } from '../errors/ai.errors';

export interface LoadedPromptTemplate {
  name: string;
  category: string;
  version: number;
  system: string;
  userTemplate: string;
  variables: string[];
  source: 'DATABASE' | 'BUNDLED_FALLBACK';
}

/**
 * PROMPT TEMPLATES — Service
 *
 * Loads the active version of a named template from the `PromptTemplate`
 * table (DB is authoritative at runtime so templates can be updated without
 * a redeploy). If the DB is unreachable, falls back to the bundled
 * `src/ai/prompt-templates/content` definitions so the AI layer degrades
 * gracefully instead of hard-failing (Fallback requirement).
 */
@Injectable()
export class PromptTemplateService {
  constructor(private readonly prisma: PrismaClient) {}

  async getActiveTemplate(name: string): Promise<LoadedPromptTemplate> {
    try {
      const record = await this.prisma.promptTemplate.findFirst({
        where: { name, isActive: true, deletedAt: null },
        orderBy: { version: 'desc' },
      });

      if (record) {
        const { system, userTemplate } = splitTemplateBody(record.templateBody);
        return {
          name: record.name,
          category: record.category,
          version: record.version,
          system,
          userTemplate,
          variables: Array.isArray(record.variables) ? (record.variables as string[]) : [],
          source: 'DATABASE',
        };
      }
    } catch (err) {
      // Swallow and fall through to bundled fallback — DB unavailability must
      // never take down prompt-dependent features entirely.
    }

    const fallback = PROMPT_TEMPLATES_BY_NAME[name];
    if (!fallback) {
      throw new AIError('PROMPT_TEMPLATE_NOT_FOUND', `No prompt template named "${name}" in DB or bundled fallback`);
    }
    return {
      name: fallback.name,
      category: fallback.category,
      version: fallback.version,
      system: fallback.system,
      userTemplate: fallback.userTemplate,
      variables: fallback.variables,
      source: 'BUNDLED_FALLBACK',
    };
  }

  listBundledDefinitions(): PromptTemplateDefinition[] {
    return Object.values(PROMPT_TEMPLATES_BY_NAME);
  }
}

function splitTemplateBody(body: string): { system: string; userTemplate: string } {
  const userIdx = body.indexOf('[USER]');
  if (!body.startsWith('[SYSTEM]') || userIdx === -1) {
    // Defensive: templates authored outside the seed convention are treated
    // as user-only with an empty system prompt rather than throwing.
    return { system: '', userTemplate: body };
  }
  const system = body.slice('[SYSTEM]'.length, userIdx).trim();
  const userTemplate = body.slice(userIdx + '[USER]'.length).trim();
  return { system, userTemplate };
}

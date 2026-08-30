import { Injectable } from '@nestjs/common';
import { PrismaClient, AIProvider as AIProviderEnum } from '@prisma/client';
import { AIProvider as IAIProvider } from '../interfaces/ai-provider.interface';
import { OpenAICompatibleProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';
import { AIError } from '../errors/ai.errors';

/**
 * PROVIDER FACTORY
 *
 * Resolves which provider + model to use for a given `purpose` (e.g. "chat",
 * "embedding", "ocr", "meal_recommendation") by reading `ModelConfiguration`
 * (Sec. AI DOMAIN — Table 43) rather than hardcoding a model name anywhere in
 * application code. Falls back to the other configured provider if the
 * primary is unavailable (Fallback requirement).
 */
@Injectable()
export class AIProviderFactory {
  private readonly providers: Record<AIProviderEnum, IAIProvider>;

  constructor(
    private readonly prisma: PrismaClient,
    openAIProvider: OpenAICompatibleProvider,
    geminiProvider: GeminiProvider,
  ) {
    this.providers = {
      OPENAI_COMPATIBLE: openAIProvider,
      GEMINI: geminiProvider,
    };
  }

  async resolveForPurpose(purpose: string): Promise<{ provider: IAIProvider; modelName: string; temperature: number; maxTokens: number }> {
    const config = await this.prisma.modelConfiguration.findFirst({
      where: { purpose, isDefault: true, deletedAt: null },
    });

    if (!config) {
      throw new AIError('PROVIDER_UNAVAILABLE' as any, `No ModelConfiguration found for purpose "${purpose}"`);
    }

    const provider = this.providers[config.provider];
    return {
      provider,
      modelName: config.modelName,
      temperature: config.temperature ?? 0.3,
      maxTokens: config.maxTokens ?? 1024,
    };
  }

  /** Returns the first provider (in preference order) that reports healthy. */
  async resolveHealthyFallback(preferredOrder: AIProviderEnum[]): Promise<IAIProvider | null> {
    for (const name of preferredOrder) {
      const provider = this.providers[name];
      if (await provider.healthCheck()) return provider;
    }
    return null;
  }

  get(name: AIProviderEnum): IAIProvider {
    return this.providers[name];
  }
}

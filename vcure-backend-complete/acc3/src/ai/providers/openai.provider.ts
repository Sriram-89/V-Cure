import { Injectable, Inject, Optional } from '@nestjs/common';
import {
  AIProvider,
  CompletionRequest,
  CompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
} from '../interfaces/ai-provider.interface';
import { ProviderError } from '../errors/ai.errors';
import { AIEnv } from '../config/ai.config';
import { withResilience } from './resilience.util';
import { AI_ENV, OPENAI_BASE_URL } from '../ai.tokens';

/**
 * OPENAI-COMPATIBLE PROVIDER
 * Sec. AI TECH STACK: "OpenAI Compatible APIs". Works against OpenAI itself
 * or any OpenAI-compatible endpoint (Azure OpenAI, self-hosted vLLM, etc.)
 * by construction — no OpenAI-specific SDK types leak past this file.
 *
 * No network calls are made from this sandbox; the HTTP call sites are
 * marked and are the only places that would need a live key to exercise.
 */
@Injectable()
export class OpenAICompatibleProvider implements AIProvider {
  readonly name = 'OPENAI_COMPATIBLE' as const;

  constructor(
    @Inject(AI_ENV) private readonly env: AIEnv,
    @Optional() @Inject(OPENAI_BASE_URL) private readonly baseUrl: string = 'https://api.openai.com/v1',
  ) {}

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const startedAt = Date.now();

    return withResilience(
      async () => {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: request.model,
            messages: request.messages,
            temperature: request.temperature,
            max_tokens: request.maxTokens,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new ProviderError('PROVIDER_RATE_LIMITED', 'OpenAI-compatible provider rate limited the request');
          }
          throw new ProviderError(
            'PROVIDER_UNAVAILABLE',
            `OpenAI-compatible provider returned HTTP ${response.status}`,
          );
        }

        const body = (await response.json()) as {
          choices: { message: { content: string }; finish_reason: string }[];
          usage?: { prompt_tokens: number; completion_tokens: number };
        };

        const choice = body.choices?.[0];
        if (!choice) {
          throw new ProviderError('PROVIDER_INVALID_RESPONSE', 'OpenAI-compatible provider returned no choices');
        }

        return {
          content: choice.message.content,
          promptTokens: body.usage?.prompt_tokens,
          completionTokens: body.usage?.completion_tokens,
          finishReason: mapFinishReason(choice.finish_reason),
          latencyMs: Date.now() - startedAt,
        } satisfies CompletionResponse;
      },
      {
        timeoutMs: this.env.AI_REQUEST_TIMEOUT_MS,
        maxRetries: this.env.AI_MAX_RETRIES,
        backoffMs: this.env.AI_RETRY_BACKOFF_MS,
        label: 'OpenAICompatibleProvider.complete',
      },
    );
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const startedAt = Date.now();

    return withResilience(
      async () => {
        const response = await fetch(`${this.baseUrl}/embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({ model: request.model, input: request.input }),
        });

        if (!response.ok) {
          throw new ProviderError(
            'PROVIDER_UNAVAILABLE',
            `OpenAI-compatible embeddings endpoint returned HTTP ${response.status}`,
          );
        }

        const body = (await response.json()) as { data: { embedding: number[] }[] };
        const vectors = body.data.map((d) => d.embedding);
        if (vectors.length === 0) {
          throw new ProviderError('PROVIDER_INVALID_RESPONSE', 'Embeddings provider returned no vectors');
        }

        return {
          vectors,
          dimensions: vectors[0].length,
          model: request.model,
          latencyMs: Date.now() - startedAt,
        } satisfies EmbeddingResponse;
      },
      {
        timeoutMs: this.env.AI_REQUEST_TIMEOUT_MS,
        maxRetries: this.env.AI_MAX_RETRIES,
        backoffMs: this.env.AI_RETRY_BACKOFF_MS,
        label: 'OpenAICompatibleProvider.embed',
      },
    );
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: { Authorization: `Bearer ${this.env.OPENAI_API_KEY}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

function mapFinishReason(reason: string): CompletionResponse['finishReason'] {
  if (reason === 'length') return 'length';
  if (reason === 'content_filter') return 'content_filter';
  if (reason === 'stop') return 'stop';
  return 'error';
}

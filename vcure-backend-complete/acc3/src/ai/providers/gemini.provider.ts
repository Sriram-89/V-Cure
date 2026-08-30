import { Injectable, Inject, Optional } from '@nestjs/common';
import {
  AIProvider,
  CompletionRequest,
  CompletionResponse,
  EmbeddingRequest,
  EmbeddingResponse,
  ChatMessage,
} from '../interfaces/ai-provider.interface';
import { VisionProvider, OCRImageInput, OCRTextResult } from '../interfaces/vision-provider.interface';
import { ProviderError } from '../errors/ai.errors';
import { AIEnv } from '../config/ai.config';
import { withResilience } from './resilience.util';
import { AI_ENV, GEMINI_BASE_URL } from '../ai.tokens';

/**
 * GEMINI PROVIDER
 * Sec. AI TECH STACK: "Gemini". Used in this Bible primarily for OCR
 * extraction (see ModelConfiguration seed: purpose="ocr") but implements the
 * full AIProvider contract so it can also serve chat/embedding if the
 * Recommendation Engine's ModelConfiguration table routes to it.
 */
@Injectable()
export class GeminiProvider implements AIProvider, VisionProvider {
  readonly name = 'GEMINI' as const;

  constructor(
    @Inject(AI_ENV) private readonly env: AIEnv,
    @Optional() @Inject(GEMINI_BASE_URL) private readonly baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta',
  ) {}

  async complete(request: CompletionRequest): Promise<CompletionResponse> {
    const startedAt = Date.now();

    return withResilience(
      async () => {
        const url = `${this.baseUrl}/models/${request.model}:generateContent?key=${this.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: toGeminiContents(request.messages),
            generationConfig: {
              temperature: request.temperature,
              maxOutputTokens: request.maxTokens,
            },
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new ProviderError('PROVIDER_RATE_LIMITED', 'Gemini provider rate limited the request');
          }
          throw new ProviderError('PROVIDER_UNAVAILABLE', `Gemini provider returned HTTP ${response.status}`);
        }

        const body = (await response.json()) as {
          candidates: { content: { parts: { text: string }[] }; finishReason: string }[];
          usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number };
        };

        const candidate = body.candidates?.[0];
        if (!candidate) {
          throw new ProviderError('PROVIDER_INVALID_RESPONSE', 'Gemini provider returned no candidates');
        }

        return {
          content: candidate.content.parts.map((p) => p.text).join(''),
          promptTokens: body.usageMetadata?.promptTokenCount,
          completionTokens: body.usageMetadata?.candidatesTokenCount,
          finishReason: mapFinishReason(candidate.finishReason),
          latencyMs: Date.now() - startedAt,
        } satisfies CompletionResponse;
      },
      {
        timeoutMs: this.env.AI_REQUEST_TIMEOUT_MS,
        maxRetries: this.env.AI_MAX_RETRIES,
        backoffMs: this.env.AI_RETRY_BACKOFF_MS,
        label: 'GeminiProvider.complete',
      },
    );
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const startedAt = Date.now();

    return withResilience(
      async () => {
        const url = `${this.baseUrl}/models/${request.model}:batchEmbedContents?key=${this.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: request.input.map((text) => ({
              model: `models/${request.model}`,
              content: { parts: [{ text }] },
            })),
          }),
        });

        if (!response.ok) {
          throw new ProviderError('PROVIDER_UNAVAILABLE', `Gemini embeddings endpoint returned HTTP ${response.status}`);
        }

        const body = (await response.json()) as { embeddings: { values: number[] }[] };
        const vectors = body.embeddings.map((e) => e.values);
        if (vectors.length === 0) {
          throw new ProviderError('PROVIDER_INVALID_RESPONSE', 'Gemini embeddings returned no vectors');
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
        label: 'GeminiProvider.embed',
      },
    );
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models?key=${this.env.GEMINI_API_KEY}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * OCR FOUNDATION — real multimodal text extraction via Gemini's vision
   * input. Used as the default OCR text-extraction step ahead of the
   * ocr_extraction_v1 structuring prompt (see ocr/ocr.service.ts).
   */
  async extractText(input: OCRImageInput): Promise<OCRTextResult> {
    const startedAt = Date.now();
    const model = 'gemini-1.5-flash';

    return withResilience(
      async () => {
        const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text:
                      'Transcribe ALL visible text from this medical/lab report image exactly as written, ' +
                      'preserving line breaks between distinct fields/rows. Do not summarize, interpret, or ' +
                      'omit any text, including headers and footers.',
                  },
                  { inline_data: { mime_type: input.mimeType, data: input.base64Image } },
                ],
              },
            ],
            generationConfig: { temperature: 0.0, maxOutputTokens: 4096 },
          }),
        });

        if (!response.ok) {
          throw new ProviderError('PROVIDER_UNAVAILABLE', `Gemini vision endpoint returned HTTP ${response.status}`);
        }

        const body = (await response.json()) as {
          candidates: { content: { parts: { text: string }[] } }[];
        };
        const candidate = body.candidates?.[0];
        if (!candidate) {
          throw new ProviderError('PROVIDER_INVALID_RESPONSE', 'Gemini vision returned no candidates');
        }

        return {
          rawText: candidate.content.parts.map((p) => p.text).join(''),
          latencyMs: Date.now() - startedAt,
        } satisfies OCRTextResult;
      },
      {
        timeoutMs: this.env.AI_REQUEST_TIMEOUT_MS,
        maxRetries: this.env.AI_MAX_RETRIES,
        backoffMs: this.env.AI_RETRY_BACKOFF_MS,
        label: 'GeminiProvider.extractText',
      },
    );
  }
}

function toGeminiContents(messages: ChatMessage[]) {
  // Gemini has no "system" role — fold system messages into the first user turn.
  const systemText = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n');
  const turns = messages.filter((m) => m.role !== 'system');
  return turns.map((m, idx) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: idx === 0 && systemText ? `${systemText}\n\n${m.content}` : m.content }],
  }));
}

function mapFinishReason(reason: string): CompletionResponse['finishReason'] {
  if (reason === 'MAX_TOKENS') return 'length';
  if (reason === 'SAFETY') return 'content_filter';
  if (reason === 'STOP') return 'stop';
  return 'error';
}

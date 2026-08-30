import { ProviderError } from '../errors/ai.errors';

/**
 * Wraps a provider call with a hard timeout and bounded exponential-backoff
 * retries. Shared by every provider implementation so retry/backoff/timeout
 * behavior is identical across OpenAI-compatible and Gemini providers
 * (CODE QUALITY: "Reusable Validators" — this is the reusable resilience
 * equivalent for provider calls).
 */
export async function withResilience<T>(
  fn: () => Promise<T>,
  opts: { timeoutMs: number; maxRetries: number; backoffMs: number; label: string },
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), opts.timeoutMs);
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener('abort', () =>
            reject(new ProviderError('PROVIDER_TIMEOUT', `${opts.label} timed out after ${opts.timeoutMs}ms`)),
          );
        }),
      ]);
      clearTimeout(timeout);
      return result;
    } catch (err) {
      clearTimeout(timeout);
      lastError = err;
      const isLastAttempt = attempt === opts.maxRetries;
      if (isLastAttempt) break;
      const backoff = opts.backoffMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }

  if (lastError instanceof ProviderError) throw lastError;
  throw new ProviderError('PROVIDER_UNAVAILABLE', `${opts.label} failed after ${opts.maxRetries + 1} attempts`, {
    cause: lastError,
  });
}

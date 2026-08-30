import { of, lastValueFrom } from 'rxjs';
import { ResponseEnvelopeInterceptor } from './response-envelope.interceptor';

const ctx = (statusCode: number) =>
  ({
    switchToHttp: () => ({ getResponse: () => ({ statusCode }) }),
  }) as any;

const handler = (value: unknown) => ({ handle: () => of(value) }) as any;

describe('ResponseEnvelopeInterceptor', () => {
  const interceptor = new ResponseEnvelopeInterceptor();

  it('wraps a 200 payload in the canonical envelope', async () => {
    const result: any = await lastValueFrom(
      interceptor.intercept(ctx(200), handler({ id: 'u1' })),
    );
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ id: 'u1' });
    expect(result.errors).toBeNull();
    expect(typeof result.timestamp).toBe('string');
    expect(Object.keys(result).sort()).toEqual(
      ['data', 'errors', 'message', 'success', 'timestamp'],
    );
  });

  it('passes 204 through without a body', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(ctx(204), handler(undefined)),
    );
    expect(result).toBeUndefined();
  });

  it('does not wrap undefined payloads', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(ctx(200), handler(undefined)),
    );
    expect(result).toBeUndefined();
  });

  it('preserves arrays as the data member', async () => {
    const result: any = await lastValueFrom(
      interceptor.intercept(ctx(200), handler([1, 2])),
    );
    expect(result.data).toEqual([1, 2]);
  });
});

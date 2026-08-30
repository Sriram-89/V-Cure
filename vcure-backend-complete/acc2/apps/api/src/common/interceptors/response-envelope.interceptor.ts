import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiEnvelope } from '../types/api-response.type';

/**
 * Wraps every successful response in the canonical envelope.
 *
 * 204 No Content is passed through untouched: writing a body onto a 204
 * violates HTTP and would break ACC1's `response.status === 204` branch.
 */
@Injectable()
export class ResponseEnvelopeInterceptor<T>
  implements NestInterceptor<T, ApiEnvelope<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiEnvelope<T> | T> {
    return next.handle().pipe(
      map((data) => {
        const response = context.switchToHttp().getResponse<{ statusCode: number }>();
        if (response.statusCode === 204 || data === undefined) {
          return data as T;
        }
        return {
          success: true,
          message: 'OK',
          data: data as T,
          errors: null,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

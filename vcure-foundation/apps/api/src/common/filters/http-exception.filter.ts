import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : null;

    const message =
      exceptionResponse && typeof exceptionResponse === 'object'
        ? (exceptionResponse as any).message
        : isHttpException
          ? exception.message
          : 'Internal server error';

    const errorName = isHttpException
      ? exception.constructor.name
      : 'InternalServerError';

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const body: ErrorResponseBody = {
      statusCode: status,
      message,
      error: errorName,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }
}

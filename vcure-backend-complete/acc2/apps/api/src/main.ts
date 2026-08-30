import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { ResponseEnvelopeInterceptor } from './common/interceptors/response-envelope.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AppConfig, true>);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = configService.get('port', { infer: true });
  await app.listen(port, '0.0.0.0');
  Logger.log(`V-Cure API running on port ${port}`, 'Bootstrap');
}

bootstrap();

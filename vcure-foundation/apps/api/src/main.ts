import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AppConfig, true>);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: configService.get('corsOrigin', { infer: true }),
    credentials: true,
  });

  const port = configService.get('port', { infer: true });
  await app.listen(port);
  Logger.log(`V-Cure API running on port ${port}`, 'Bootstrap');
}

bootstrap();

// Must be first: initialises Sentry (no-op without SENTRY_DSN) before anything loads.
import './instrument';
import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Input validation is handled per-route by ZodValidationPipe (shared @nenap/types
  // schemas), so we don't register Nest's class-validator-based ValidationPipe.

  app.enableCors({
    origin: config.get<string[]>('CORS_ORIGINS') ?? ['http://localhost:3000'],
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nenap API')
    .setDescription('Backend API for Nenap — calm knowledge capture.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  // Hosts like Render/Cloud Run inject PORT; honour it first. Bind 0.0.0.0 for containers.
  const port = Number(process.env.PORT) || config.get<number>('BACKEND_PORT') || 4000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Nenap backend listening on port ${port} (docs at /docs)`);
}

void bootstrap();

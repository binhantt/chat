import './load-env';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import compression from 'compression';
import { AppModule } from './app.module';
import {
  createCorsOriginChecker,
  createOriginGuard,
  getAllowedOrigins,
  securityHeadersMiddleware,
} from './security/security.config';
import { InputSanitizationPipe } from './security/input-sanitization.pipe';
import { HttpLoggerInterceptor } from './common/interceptors/http-logger.interceptor';
import { PublicRoleInterceptor } from './common/interceptors/public-role.interceptor';
import { join } from 'node:path';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = getAllowedOrigins();

  app.setGlobalPrefix('api');

  // Serve uploaded files (avatars, etc.)
  const uploadsPath = join(__dirname, '..', 'uploads');
  app.use('/api/uploads', express.static(uploadsPath, {
    maxAge: '7d',
    etag: true,
    lastModified: true,
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    },
  }));
  app.use(compression());
  app.use(securityHeadersMiddleware);
  app.use(createOriginGuard(allowedOrigins));
  app.useGlobalPipes(new InputSanitizationPipe());
  app.useGlobalInterceptors(
    new PublicRoleInterceptor(),
    new HttpLoggerInterceptor(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors({
    origin: createCorsOriginChecker(allowedOrigins),
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();

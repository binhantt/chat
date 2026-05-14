import './load-env';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  createCorsOriginChecker,
  createOriginGuard,
  getAllowedOrigins,
  securityHeadersMiddleware,
} from './security/security.config';
import { InputSanitizationPipe } from './security/input-sanitization.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = getAllowedOrigins();

  app.setGlobalPrefix('api');
  app.use(securityHeadersMiddleware);
  app.use(createOriginGuard(allowedOrigins));
  app.useGlobalPipes(new InputSanitizationPipe());
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

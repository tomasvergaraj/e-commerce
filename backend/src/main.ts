import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';
import {
  getAllowedOrigins,
  getPublicAppUrl,
  getUploadsDir,
  isOriginAllowed,
} from './common/config/runtime.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix('api');

  const allowedOrigins = getAllowedOrigins(
    config.get<string>('FRONTEND_URL'),
    config.get<string>('CORS_ORIGINS'),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
  });

  const uploadsPath = getUploadsDir(config.get<string>('UPLOAD_DIR'));
  mkdirSync(uploadsPath, { recursive: true });
  app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nexo E-Commerce API')
    .setDescription('API para el sistema de e-commerce Nexo')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);

  const appUrl = getPublicAppUrl(config.get<string>('APP_URL'), port);
  console.log(`[bootstrap] Nexo API running on ${appUrl}`);
  console.log(`[bootstrap] Swagger docs at ${appUrl}/api/docs`);
  console.log(`[bootstrap] Allowed CORS origins: ${allowedOrigins.join(', ')}`);
}

bootstrap();

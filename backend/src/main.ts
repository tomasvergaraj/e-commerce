import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { mkdirSync } from 'fs';
import {
  json,
  urlencoded,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import { AppModule } from './app.module';
import {
  assertSecureRuntimeConfig,
  getAllowedOrigins,
  getPublicAppUrl,
  getRequestBodyLimit,
  getUploadsDir,
  isOriginAllowed,
  isProduction,
  isSwaggerEnabled,
} from './common/config/runtime.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const nodeEnv = config.get<string>('NODE_ENV');

  app.setGlobalPrefix('api');
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  const allowedOrigins = getAllowedOrigins(
    config.get<string>('FRONTEND_URL'),
    config.get<string>('CORS_ORIGINS'),
  );

  assertSecureRuntimeConfig({
    nodeEnv,
    jwtSecret: config.get<string>('JWT_SECRET'),
    allowedOrigins,
  });

  const requestBodyLimit = getRequestBodyLimit(config.get<string>('REQUEST_BODY_LIMIT'));

  app.use(json({ limit: requestBodyLimit }));
  app.use(urlencoded({ extended: true, limit: requestBodyLimit }));
  app.use((request: Request, response: Response, next: NextFunction) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-DNS-Prefetch-Control', 'off');
    response.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    );

    const forwardedProto = typeof request.headers['x-forwarded-proto'] === 'string'
      ? request.headers['x-forwarded-proto'].split(',')[0].trim()
      : '';

    if (request.secure || forwardedProto === 'https') {
      response.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    }

    next();
  });

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    maxAge: 60 * 60 * 24,
    optionsSuccessStatus: 204,
  });

  const uploadsPath = getUploadsDir(config.get<string>('UPLOAD_DIR'));
  mkdirSync(uploadsPath, { recursive: true });
  app.useStaticAssets(uploadsPath, { prefix: '/uploads/' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
      stopAtFirstError: true,
      transformOptions: { enableImplicitConversion: true },
      disableErrorMessages: isProduction(nodeEnv),
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  if (isSwaggerEnabled(nodeEnv, config.get<string>('ENABLE_SWAGGER'))) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Nexo E-Commerce API')
      .setDescription('API para el sistema de e-commerce Nexo')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = config.get<number>('PORT', 3000);
  await app.listen(port, '0.0.0.0');

  const appUrl = getPublicAppUrl(config.get<string>('APP_URL'), port);
  console.log(`[bootstrap] Nexo API running on ${appUrl}`);
  console.log(
    `[bootstrap] Swagger docs ${
      isSwaggerEnabled(nodeEnv, config.get<string>('ENABLE_SWAGGER'))
        ? `at ${appUrl}/api/docs`
        : 'disabled'
    }`,
  );
  console.log(`[bootstrap] Allowed CORS origins: ${allowedOrigins.join(', ')}`);
  console.log(`[bootstrap] Request body limit: ${requestBodyLimit}`);
}

bootstrap();

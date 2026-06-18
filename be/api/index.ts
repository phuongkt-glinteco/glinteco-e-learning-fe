import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let expressApp: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: ['http://localhost:6336'],
    credentials: true,
  });

  // Redirect Swagger UI static assets to CDN to avoid 404s in serverless environments
  app.use((req: any, res: any, next: any) => {
    if (req.url.includes('swagger-ui.css')) {
      return res.redirect('https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css');
    }
    if (req.url.includes('swagger-ui-bundle.js')) {
      return res.redirect('https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js');
    }
    if (req.url.includes('swagger-ui-standalone-preset.js')) {
      return res.redirect('https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js');
    }
    if (req.url.includes('favicon-32x32.png')) {
      return res.redirect('https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-32x32.png');
    }
    if (req.url.includes('favicon-16x16.png')) {
      return res.redirect('https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/favicon-16x16.png');
    }
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('RAMP UP — Engineering Onboarding Portal API')
    .setDescription(
      'Tài liệu đặc tả API (OpenAPI Specification) cho hệ thống **RAMP UP** (Glinteco e-Learning).',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css',
    customJs: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js',
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js',
    ],
  });

  await app.init();
  expressApp = app.getHttpAdapter().getInstance();
}

let isAppInitialized = false;
const initPromise = bootstrap().then(() => {
  isAppInitialized = true;
});

export default async (req: any, res: any) => {
  if (!isAppInitialized) {
    await initPromise;
  }
  expressApp(req, res);
};

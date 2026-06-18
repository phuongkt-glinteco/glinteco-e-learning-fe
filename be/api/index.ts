import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

let expressApp: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: ['http://localhost:6336'],
    credentials: true,
  });

  // Swagger OpenAPI Documentation - load first so it can be served via middleware
  let yamlContent: string | null = null;
  let document: any;
  const yamlPaths = [
    path.join(process.cwd(), 'docs/openapi.yaml'),
    path.join(process.cwd(), '../docs/openapi.yaml'),
    path.join(__dirname, '..', '..', 'docs/openapi.yaml'),
  ];
  let foundPath: string | null = null;
  for (const p of yamlPaths) {
    if (fs.existsSync(p)) {
      foundPath = p;
      break;
    }
  }

  if (foundPath) {
    console.log(`Loading OpenAPI Spec from: ${foundPath}`);
    try {
      yamlContent = fs.readFileSync(foundPath, 'utf8');
      document = yaml.load(yamlContent);
    } catch (err) {
      console.error(`Error loading or parsing openapi.yaml:`, err);
    }
  }

  // Redirect Swagger UI static assets to CDN and serve raw/JSON OpenAPI doc directly
  app.use((req: any, res: any, next: any) => {
    if (req.url.endsWith('/openapi.yaml') || req.url.endsWith('/openapi.yml')) {
      if (yamlContent) {
        res.setHeader('Content-Type', 'text/yaml');
        return res.send(yamlContent);
      }
    }
    if (req.url.endsWith('/openapi.json')) {
      if (document) {
        res.setHeader('Content-Type', 'application/json');
        return res.send(JSON.stringify(document, null, 2));
      }
    }
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

  if (!document) {
    console.log('Generating Swagger document dynamically...');
    const config = new DocumentBuilder()
      .setTitle('RAMP UP — Engineering Onboarding Portal API')
      .setDescription(
        'Tài liệu đặc tả API (OpenAPI Specification) cho hệ thống **RAMP UP** (Glinteco e-Learning).',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    document = SwaggerModule.createDocument(app, config);
  }

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

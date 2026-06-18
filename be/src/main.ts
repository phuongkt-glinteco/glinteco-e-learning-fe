import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Enable CORS
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
      const rawYaml = fs.readFileSync(foundPath, 'utf8');
      const parsedDoc = yaml.load(rawYaml) as any;
      if (parsedDoc && typeof parsedDoc === 'object') {
        const currentServerUrl = process.env.NODE_ENV === 'production'
          ? 'https://be-teal-tau.vercel.app/api/v1'
          : `http://localhost:${process.env.PORT || 5000}/${apiPrefix}`;

        parsedDoc.servers = [
          {
            url: currentServerUrl,
            description: process.env.NODE_ENV === 'production' ? 'Môi trường Production (Vercel)' : 'Môi trường Local Development',
          }
        ];
        document = parsedDoc;
        yamlContent = yaml.dump(document);
      } else {
        yamlContent = rawYaml;
        document = parsedDoc;
      }
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

  // Global validation pipe
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

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(
    `Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  console.log(
    `Swagger documentation is available at: http://localhost:${port}/${apiPrefix}/docs`,
  );
}
void bootstrap();

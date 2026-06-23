import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
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

  // Run baseline SQL query to populate migrations table on production
  try {
    const dataSource = app.get(DataSource);
    await dataSource.query(`CREATE TABLE IF NOT EXISTS "migrations" ("id" SERIAL PRIMARY KEY, "timestamp" bigint NOT NULL, "name" varchar NOT NULL)`);
    await dataSource.query(`
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1781611485949, 'InitialSchema1781611485949' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'InitialSchema1781611485949');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1781616508023, 'AddGoogleIdToUsers1781616508023' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'AddGoogleIdToUsers1781616508023');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1781700000000, 'AddAuthSchema1781700000000' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'AddAuthSchema1781700000000');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1781615351400, 'UpdateUserAndLessonProgress1781615351400' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'UpdateUserAndLessonProgress1781615351400');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1781617000000, 'UpdateSubmissionStatusEnum1781617000000' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'UpdateSubmissionStatusEnum1781617000000');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1781617100000, 'AddTrackOrderIndex1781617100000' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'AddTrackOrderIndex1781617100000');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1781617508000, 'AddKindToDocumentsAndSearchIndexes1781617508000' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'AddKindToDocumentsAndSearchIndexes1781617508000');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1781622361007, 'AddExerciseDetails1781622361007' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'AddExerciseDetails1781622361007');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1781623541186, 'AddUserBookmarks1781623541186' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'AddUserBookmarks1781623541186');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1781624224625, 'AddIsActiveToCohorts1781624224625' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'AddIsActiveToCohorts1781624224625');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1781628751000, 'AddLessonsCompletedToTrackProgress1781628751000' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'AddLessonsCompletedToTrackProgress1781628751000');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1781700100000, 'AddResetPasswordFieldsToUser1781700100000' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'AddResetPasswordFieldsToUser1781700100000');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1781700200000, 'CreateNotificationsTable1781700200000' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'CreateNotificationsTable1781700200000');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1784301321000, 'AddLeaderboardIndexes1784301321000' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'AddLeaderboardIndexes1784301321000');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1784301322000, 'UpdateSubmissionHistorySchema1784301322000' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'UpdateSubmissionHistorySchema1784301322000');
      INSERT INTO "migrations" ("timestamp", "name")
      SELECT 1784400000000, 'UpdateTracksAndLessonsSchema1784400000000' WHERE NOT EXISTS (SELECT 1 FROM "migrations" WHERE name = 'UpdateTracksAndLessonsSchema1784400000000');
    `);
    // Ensure any mistakenly baselined entry for AddLastClaimedXpAtToUsers is removed
    await dataSource.query(`DELETE FROM "migrations" WHERE name = 'AddLastClaimedXpAtToUsers1784301323000';`);
    console.log('✅ Baseline migrations check/insert completed.');
    console.log('Running any pending migrations...');
    await dataSource.runMigrations();
    console.log('✅ Migrations completed successfully.');
  } catch (dbErr) {
    console.error('❌ Failed to run baseline migrations check/insert or migrations:', dbErr);
  }

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

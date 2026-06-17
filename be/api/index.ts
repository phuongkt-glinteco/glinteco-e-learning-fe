import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

async function bootstrap(expressInstance: express.Express) {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: ['http://localhost:6336'],
    credentials: true,
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
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.init();
}

let isAppInitialized = false;
const initPromise = bootstrap(server).then(() => {
  isAppInitialized = true;
});

export default async (req: any, res: any) => {
  if (!isAppInitialized) {
    await initPromise;
  }
  server(req, res);
};

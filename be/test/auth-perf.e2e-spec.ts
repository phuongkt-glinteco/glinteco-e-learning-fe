/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { User } from '../src/database/entities/user.entity';
import { RefreshToken } from '../src/database/entities/refresh-token.entity';

describe('Auth API Performance (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  const testEmail = 'perf-test@example.com';
  const testPassword = 'securePassword123';
  const testName = 'Performance Test User';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.getRepository(RefreshToken).clear();
    await dataSource.getRepository(User).delete({ email: testEmail });
  });

  it('should measure latency of registration (password hashing + db insert)', async () => {
    const start = performance.now();
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: testName,
      })
      .expect(201);
    const duration = performance.now() - start;
    console.log(`[PERF] Registration API took ${duration.toFixed(2)}ms`);

    // Registration has bcrypt hashing (salt rounds = 10) which is CPU intensive.
    // It should ordinarily complete in < 500ms on a standard runner.
    expect(duration).toBeLessThan(500);
  });

  it('should measure latency of login (db query + bcrypt compare + jwt sign)', async () => {
    // 1. Register the user
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: testEmail,
      password: testPassword,
      name: testName,
    });

    // 2. Measure login time
    const start = performance.now();
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(200);
    const duration = performance.now() - start;
    console.log(`[PERF] Login API took ${duration.toFixed(2)}ms`);

    expect(duration).toBeLessThan(500);
  });

  it('should measure latency of get profile (fast token validation + db query by id)', async () => {
    // 1. Register and login
    await request(app.getHttpServer()).post('/api/v1/auth/register').send({
      email: testEmail,
      password: testPassword,
      name: testName,
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });
    const accessToken = loginRes.body.accessToken;

    // 2. Measure profile api (database query speed)
    const start = performance.now();
    await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const duration = performance.now() - start;
    console.log(
      `[PERF] Profile Retrieval (/me) API took ${duration.toFixed(2)}ms`,
    );

    // A database query by ID with a pre-validated token should be extremely fast (< 100ms)
    expect(duration).toBeLessThan(100);
  });
});

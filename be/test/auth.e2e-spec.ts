/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { User } from '../src/database/entities/user.entity';
import { RefreshToken } from '../src/database/entities/refresh-token.entity';
import { JwtService } from '@nestjs/jwt';

describe('AuthModule (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  const testEmail = 'e2e-test@example.com';
  const testPassword = 'securePassword123';
  const testName = 'E2E Test User';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up existing test users and tokens to ensure isolation
    await dataSource.getRepository(RefreshToken).clear();
    await dataSource.getRepository(User).delete({ email: testEmail });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully and hash password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testEmail);
      expect(response.body.name).toBe(testName);
      expect(response.body).not.toHaveProperty('password');

      // Verify the user is persisted in the DB
      const user = await dataSource.getRepository(User).findOne({
        where: { email: testEmail },
        select: { id: true, email: true, password: true },
      });
      expect(user).toBeDefined();
      expect(user?.password).not.toBe(testPassword); // Passwords must be hashed
    });

    it('should return 400 Bad Request on duplicate email registration', async () => {
      // Create first user
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
        })
        .expect(201);

      // Attempt duplicate
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'differentPassword',
          name: 'Another Name',
        })
        .expect(400);

      expect(response.body.message).toContain('Email đã được sử dụng');
    });

    it('should return 400 Bad Request on invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'invalid-email',
          password: testPassword,
          name: testName,
        })
        .expect(400);

      expect(response.body.message).toContainEqual(
        expect.stringContaining('Định dạng email không hợp lệ'),
      );
    });

    it('should return 400 Bad Request on short password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: 'short',
          name: testName,
        })
        .expect(400);

      expect(response.body.message).toContainEqual(
        expect.stringContaining('Mật khẩu phải chứa ít nhất 8 ký tự'),
      );
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      // Register a user for login testing
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
        })
        .expect(201);
    });

    it('should authenticate successfully with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn');
    });

    it('should return 401 Unauthorized with incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: 'wrongPassword',
        })
        .expect(401);
    });

    it('should return 401 Unauthorized with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testPassword,
        })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Register & Login to get a refresh token
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
        })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });
      refreshToken = loginRes.body.refreshToken;
    });

    it('should successfully rotate tokens with a valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('expiresIn');
      expect(response.body.refreshToken).not.toBe(refreshToken); // Must be rotated
    });

    it('should return 400 Bad Request if refresh token is not a valid JWT format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(400);
    });

    it('should return 401 Unauthorized with an expired or invalid signature refresh token', async () => {
      const jwtService = app.get(JwtService);
      const invalidToken = await jwtService.signAsync(
        { sub: 'user-id-123', jti: 'some-uuid' },
        { secret: 'wrong-secret', expiresIn: '1h' },
      );
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: invalidToken })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      // Register & Login to get tokens
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
        })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });
      accessToken = loginRes.body.accessToken;
      refreshToken = loginRes.body.refreshToken;
    });

    it('should log out successfully and invalidate the refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })
        .expect(200);

      // Verify the refresh token is deleted from DB
      const dbTokens = await dataSource.getRepository(RefreshToken).find();
      expect(dbTokens.length).toBe(0);

      // Verify we can no longer refresh with this token
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(401);
    });

    it('should return 401 Unauthorized if call lacks bearer token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({ refreshToken })
        .expect(401);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
        })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });
      accessToken = loginRes.body.accessToken;
    });

    it('should return profile information for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe(testEmail);
      expect(response.body.name).toBe(testName);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 Unauthorized for unauthenticated request', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });
  });
});

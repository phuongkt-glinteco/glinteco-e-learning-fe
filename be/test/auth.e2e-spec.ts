/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from './../src/app.module';
import { User } from '../src/database/entities/user.entity';
import { RefreshToken } from '../src/database/entities/refresh-token.entity';
import { Cohort } from '../src/database/entities/cohort.entity';
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
    await dataSource.query(`UPDATE "users" SET "cohortId" = NULL`);
    await dataSource.getRepository(Cohort).delete({ name: 'E2E Default Cohort' });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should assign a default cohort to the user when registered', async () => {
      const cohortRepo = dataSource.getRepository(Cohort);
      const cohort = await cohortRepo.save(
        cohortRepo.create({
          name: 'E2E Default Cohort',
          isActive: true,
          isDefault: true,
          targetRampDays: 30,
        }),
      );

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
        })
        .expect(201);

      expect(response.body.cohortId).toBe(cohort.id);

      const user = await dataSource.getRepository(User).findOne({
        where: { email: testEmail },
      });
      expect(user?.cohortId).toBe(cohort.id);
    });

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
    let cohortId: string;

    beforeEach(async () => {
      const cohortRepo = dataSource.getRepository(Cohort);
      const cohort = await cohortRepo.save(
        cohortRepo.create({
          name: 'E2E Default Cohort',
          isActive: true,
          isDefault: true,
          targetRampDays: 30,
        }),
      );
      cohortId = cohort.id;

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

    it('should return profile information for authenticated user including cohort object', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe(testEmail);
      expect(response.body.name).toBe(testName);
      expect(response.body).not.toHaveProperty('password');
      expect(response.body.cohort).toEqual({
        id: cohortId,
        name: 'E2E Default Cohort',
      });
    });

    it('should return 401 Unauthorized for unauthenticated request', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });
  });

  describe('Password Reset & Change (E2E)', () => {
    beforeEach(async () => {
      // Register a user for forgot/reset password testing
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          name: testName,
        })
        .expect(201);
    });

    it('should handle forgot-password flow correctly', async () => {
      // 1. Existing email
      const forgotRes = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: testEmail })
        .expect(200);

      expect(forgotRes.body.success).toBe(true);
      expect(forgotRes.body).toHaveProperty('resetToken');
      expect(forgotRes.body).toHaveProperty('resetUrl');

      const resetToken = forgotRes.body.resetToken;

      // 2. Reset password
      const newPassword = 'newPassword12345';
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: resetToken, password: newPassword })
        .expect(200);

      // 3. Login with new password
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: newPassword })
        .expect(200);

      // 4. Old password should fail
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(401);

      // 5. Token should be invalidated (cannot reset again)
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: resetToken, password: 'anotherNewPassword' })
        .expect(400);
    });

    it('should not leak token/URL for non-existent email', async () => {
      const forgotRes = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'nonexistent-email@example.com' })
        .expect(200);

      expect(forgotRes.body.success).toBe(true);
      expect(forgotRes.body.message).toBe('Tạo yêu cầu thành công');
      expect(forgotRes.body).not.toHaveProperty('resetToken');
      expect(forgotRes.body).not.toHaveProperty('resetUrl');
    });

    it('should change password in-profile using JWT', async () => {
      // 1. Login to get access token
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: testPassword })
        .expect(200);

      const accessToken = loginRes.body.accessToken;
      const newPassword = 'myNewPassword123';

      // 2. Change password
      await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: testPassword, newPassword })
        .expect(200);

      // 3. Login with new password should succeed
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testEmail, password: newPassword })
        .expect(200);

      // 4. Change password with wrong current password should fail
      await request(app.getHttpServer())
        .post('/api/v1/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: 'wrong-password', newPassword: 'anotherPassword123' })
        .expect(400);
    });
  });
});

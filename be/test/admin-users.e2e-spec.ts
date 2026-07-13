/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { User, UserRole } from '../src/database/entities/user.entity';
import { Cohort } from '../src/database/entities/cohort.entity';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

describe('AdminUsersController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let userRepo: Repository<User>;
  let cohortRepo: Repository<Cohort>;
  let jwtService: JwtService;

  let adminToken: string;
  let learnerToken: string;

  const adminId = 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1';
  const learnerId = 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2';
  const targetId = 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3';
  let testCohortId: string;

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

    dataSource = moduleFixture.get<DataSource>(DataSource);
    userRepo = dataSource.getRepository(User);
    cohortRepo = dataSource.getRepository(Cohort);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    adminToken = jwtService.sign({ sub: adminId, role: UserRole.ADMIN });
    learnerToken = jwtService.sign({ sub: learnerId, role: UserRole.LEARNER });
  });

  beforeEach(async () => {
    // Clear test data
    await dataSource.query(
      `DELETE FROM "submissions" WHERE "userId" IN ('${adminId}', '${learnerId}', '${targetId}')`,
    );
    await dataSource.query(
      `DELETE FROM "track_progresses" WHERE "userId" IN ('${adminId}', '${learnerId}', '${targetId}')`,
    );
    await dataSource.query(
      `DELETE FROM "lesson_progresses" WHERE "userId" IN ('${adminId}', '${learnerId}', '${targetId}')`,
    );
    await dataSource.query(
      `DELETE FROM "refresh_tokens" WHERE "userId" IN ('${adminId}', '${learnerId}', '${targetId}')`,
    );
    await dataSource.query(
      `DELETE FROM "notifications" WHERE "userId" IN ('${adminId}', '${learnerId}', '${targetId}')`,
    );
    await dataSource.query(
      `DELETE FROM "users" WHERE "id" IN ('${adminId}', '${learnerId}', '${targetId}')`,
    );
    await dataSource.query(`UPDATE "users" SET "cohortId" = NULL`);
    await dataSource.query(
      `DELETE FROM "cohorts" WHERE "name" = 'E2E Test Cohort'`,
    );

    // Create test cohort
    const cohort = await cohortRepo.save(
      cohortRepo.create({
        name: 'E2E Test Cohort',
        isActive: true,
        targetRampDays: 30,
      }),
    );
    testCohortId = cohort.id;

    // Create users
    await userRepo.save([
      userRepo.create({
        id: adminId,
        email: 'admin@glinteco.com',
        name: 'Admin E2E',
        role: UserRole.ADMIN,
        isActive: true,
      }),
      userRepo.create({
        id: learnerId,
        email: 'learner@glinteco.com',
        name: 'Learner E2E',
        role: UserRole.LEARNER,
        isActive: true,
      }),
      userRepo.create({
        id: targetId,
        email: 'target@glinteco.com',
        name: 'Target E2E',
        role: UserRole.LEARNER,
        isActive: true,
      }),
    ]);
  });

  afterAll(async () => {
    await dataSource.query(
      `DELETE FROM "submissions" WHERE "userId" IN ('${adminId}', '${learnerId}', '${targetId}')`,
    );
    await dataSource.query(
      `DELETE FROM "track_progresses" WHERE "userId" IN ('${adminId}', '${learnerId}', '${targetId}')`,
    );
    await dataSource.query(
      `DELETE FROM "lesson_progresses" WHERE "userId" IN ('${adminId}', '${learnerId}', '${targetId}')`,
    );
    await dataSource.query(
      `DELETE FROM "refresh_tokens" WHERE "userId" IN ('${adminId}', '${learnerId}', '${targetId}')`,
    );
    await dataSource.query(
      `DELETE FROM "notifications" WHERE "userId" IN ('${adminId}', '${learnerId}', '${targetId}')`,
    );
    await dataSource.query(
      `DELETE FROM "users" WHERE "id" IN ('${adminId}', '${learnerId}', '${targetId}')`,
    );
    await dataSource.query(`UPDATE "users" SET "cohortId" = NULL`);
    await dataSource.query(
      `DELETE FROM "cohorts" WHERE "name" = 'E2E Test Cohort'`,
    );
    await app.close();
  });

  describe('RBAC Access Control', () => {
    it('should reject non-admin requests with 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(403);
    });

    it('should allow admin requests with 200 OK', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
    });
  });

  describe('GET /api/v1/admin/users', () => {
    it('should search users by name', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/users')
        .query({ q: 'Target' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe(targetId);
    });
  });

  describe('POST /api/v1/admin/users', () => {
    it('should create a new user successfully', async () => {
      const payload = {
        email: 'created@glinteco.com',
        name: 'Created User',
        password: 'Password123!',
        role: UserRole.LEARNER,
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.email).toBe(payload.email);
      expect(res.body).not.toHaveProperty('password');

      // Clean up newly created user
      await userRepo.delete({ email: payload.email });
    });

    it('should return 409 Conflict if email already exists', async () => {
      const payload = {
        email: 'learner@glinteco.com',
        name: 'Duplicate',
        password: 'Password123!',
      };

      await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(409);
    });
  });

  describe('PATCH /api/v1/admin/users/:id', () => {
    it('should update role and cohortId', async () => {
      const payload = {
        role: UserRole.ADMIN,
        cohortId: testCohortId,
      };

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${targetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(200);

      expect(res.body.role).toBe(UserRole.ADMIN);
      expect(res.body.cohortId).toBe(testCohortId);
    });

    it('should throw 400 Bad Request if cohortId is invalid', async () => {
      const payload = {
        cohortId: '00000000-0000-0000-0000-000000000000',
      };

      await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${targetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/role', () => {
    it('should change user role', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${targetId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: UserRole.ADMIN })
        .expect(200);

      expect(res.body.role).toBe(UserRole.ADMIN);
    });

    it('should reject self role demotion/change with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${adminId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: UserRole.LEARNER })
        .expect(400);
    });
  });

  describe('POST /api/v1/admin/users/:id/ban & unban', () => {
    it('should ban the user and block their access, then unban and restore', async () => {
      // 1. Seed target user with known password hash and log in
      const hash = await bcrypt.hash('Secret123', 10);
      await userRepo.update(targetId, { password: hash });

      const targetLoginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'target@glinteco.com', password: 'Secret123' })
        .expect(200);

      const targetToken = (targetLoginRes.body as { accessToken: string })
        .accessToken;

      // 2. Target user makes a successful request
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${targetToken}`)
        .expect(200);

      // 3. Admin bans target user
      await request(app.getHttpServer())
        .post(`/api/v1/admin/users/${targetId}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Spamming' })
        .expect(200);

      // 4. Target user tries to access API -> blocked with 401 (token invalidated)
      const blockedRes = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${targetToken}`)
        .expect(401);

      expect(blockedRes.body['error']).toBe('AccountBanned');

      // 5. Admin unbans target user
      await request(app.getHttpServer())
        .post(`/api/v1/admin/users/${targetId}/unban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // 6. Target user access restored -> succeeds with 200
      await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${targetToken}`)
        .expect(200);
    });

    it('should reject self-ban with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/admin/users/${adminId}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Banning myself' })
        .expect(400);
    });
  });

  describe('DELETE /api/v1/admin/users/:id', () => {
    it('should delete target user successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/admin/users/${targetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deleted = await userRepo.findOne({ where: { id: targetId } });
      expect(deleted).toBeNull();
    });

    it('should reject self-delete with 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/admin/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/admin/users/:id/cohort', () => {
    it('should assign user to cohort successfully and reject duplicate assignment', async () => {
      // 1. Assign target user to testCohortId
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${targetId}/cohort`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ cohortId: testCohortId })
        .expect(200);

      const updated = await userRepo.findOne({ where: { id: targetId } });
      expect(updated?.cohortId).toBe(testCohortId);

      // 2. Assigning the same cohort should throw 409 Conflict
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${targetId}/cohort`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ cohortId: testCohortId })
        .expect(409);
    });

    it('should throw 404 for non-existent cohort', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/admin/users/${targetId}/cohort`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ cohortId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
        .expect(404);
    });
  });
});

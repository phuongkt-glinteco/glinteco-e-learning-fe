import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { User, UserRole } from '../src/database/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

interface ResponseBodyMe {
  id: string;
  name: string;
  title: string | null;
  avatarHue: number | null;
}

interface ResponseBodyStats {
  level: number;
  xp: number;
  streakDays: number;
  overallCompletion: number;
  tracks: {
    completed: number;
    total: number;
  };
  exercises: {
    approved: number;
    total: number;
    awaitingReview: number;
  };
}

interface ResponseBodyError {
  message: string | string[];
  error: string;
  statusCode: number;
}

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let userRepo: Repository<User>;
  let jwtService: JwtService;
  let authToken: string;
  const mockUserId = 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2';

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
    jwtService = moduleFixture.get<JwtService>(JwtService);
    authToken = jwtService.sign({ sub: mockUserId, role: UserRole.LEARNER });
  });

  beforeEach(async () => {
    // Clean and seed specific user before each test to ensure predictable stats
    await dataSource.query(
      `DELETE FROM "submissions" WHERE "userId" = '${mockUserId}'`,
    );
    await dataSource.query(
      `DELETE FROM "track_progresses" WHERE "userId" = '${mockUserId}'`,
    );
    await dataSource.query(
      `DELETE FROM "lesson_progresses" WHERE "userId" = '${mockUserId}'`,
    );
    await dataSource.query(`DELETE FROM "users" WHERE "id" = '${mockUserId}'`);

    await userRepo.save(
      userRepo.create({
        id: mockUserId,
        email: 'mina@glinteco.com',
        name: 'Mina Learner',
        role: UserRole.LEARNER,
        level: 2,
        xp: 720,
        streakDays: 4,
      }),
    );
  });

  afterAll(async () => {
    // Clean up
    await dataSource.query(
      `DELETE FROM "submissions" WHERE "userId" = '${mockUserId}'`,
    );
    await dataSource.query(
      `DELETE FROM "track_progresses" WHERE "userId" = '${mockUserId}'`,
    );
    await dataSource.query(
      `DELETE FROM "lesson_progresses" WHERE "userId" = '${mockUserId}'`,
    );
    await dataSource.query(`DELETE FROM "users" WHERE "id" = '${mockUserId}'`);
    await app.close();
  });

  describe('PATCH /api/v1/users/me', () => {
    it('should update user profile successfully with valid fields', async () => {
      const payload = {
        name: 'Mina Updated',
        title: 'Middle Backend Engineer',
        avatarHue: 180,
      };

      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      const body = response.body as ResponseBodyMe;
      expect(body).toEqual({
        id: mockUserId,
        name: 'Mina Updated',
        title: 'Middle Backend Engineer',
        avatarHue: 180,
      });

      // Verify DB update
      const user = await userRepo.findOne({ where: { id: mockUserId } });
      expect(user?.name).toBe('Mina Updated');
      expect(user?.title).toBe('Middle Backend Engineer');
      expect(user?.avatarHue).toBe(180);
    });

    it('should reject extra fields (email/role) with 400 Bad Request', async () => {
      const payload = {
        name: 'Hacker',
        email: 'hacker@example.com',
      };

      const response = await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(400);

      const body = response.body as ResponseBodyError;
      const message = Array.isArray(body.message)
        ? body.message.join(' ')
        : body.message;
      expect(message).toContain('property email should not exist');
    });

    it('should reject avatarHue out of range with 400 Bad Request', async () => {
      const payload = {
        avatarHue: 500,
      };

      await request(app.getHttpServer())
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(400);
    });
  });

  describe('GET /api/v1/users/me/stats', () => {
    it('should return correct learner stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/users/me/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const body = response.body as ResponseBodyStats;
      expect(body).toHaveProperty('level', 2);
      expect(body).toHaveProperty('xp', 720);
      expect(body).toHaveProperty('streakDays', 4);
      expect(body).toHaveProperty('overallCompletion');
      expect(body.tracks).toHaveProperty('completed');
      expect(body.tracks).toHaveProperty('total');
      expect(body.exercises).toHaveProperty('approved');
      expect(body.exercises).toHaveProperty('total');
      expect(body.exercises).toHaveProperty('awaitingReview');
    });

    it('should respond within 200ms (performance check)', async () => {
      const start = Date.now();
      await request(app.getHttpServer())
        .get('/api/v1/users/me/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200);
    });
  });
});

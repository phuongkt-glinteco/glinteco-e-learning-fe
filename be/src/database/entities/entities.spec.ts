/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { join } from 'path';
import { Client } from 'pg';
import { DataSource } from 'typeorm';
import {
  Cohort,
  User,
  UserRole,
  Track,
  Lesson,
  TrackProgress,
  ProgressStatus,
  Exercise,
  ExerciseDifficulty,
  Submission,
  SubmissionStatus,
  SubmissionHistory,
  Tag,
  Document,
  RefreshToken,
  LessonProgress,
  Notification,
} from './index';

describe('Database Entities', () => {
  let pgClient: Client;
  let dataSource: DataSource;
  const dbName = 'rampup_test_entities';

  beforeAll(async () => {
    // Connect to postgres to create the test database
    pgClient = new Client({
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5435', 10),
      user: process.env.DATABASE_USER || 'rampup_user',
      password: process.env.DATABASE_PASSWORD || 'rampup_password',
      database: 'postgres',
    });
    await pgClient.connect();

    // Drop if exists and create
    await pgClient.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    await pgClient.query(`CREATE DATABASE "${dbName}"`);

    // Initialize TypeORM DataSource on the test database
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5435', 10),
      username: process.env.DATABASE_USER || 'rampup_user',
      password: process.env.DATABASE_PASSWORD || 'rampup_password',
      database: dbName,
      entities: [
        Cohort,
        User,
        Track,
        Lesson,
        TrackProgress,
        Exercise,
        Submission,
        SubmissionHistory,
        Tag,
        Document,
        RefreshToken,
        LessonProgress,
        Notification,
      ],
      migrations: [join(__dirname, '../migrations/[0-9]*.{ts,js}')],
      synchronize: false,
      logging: false,
    });
    await dataSource.initialize();

    // Run all migrations to setup schema automatically
    await dataSource.runMigrations();
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    if (pgClient) {
      await pgClient.query(`DROP DATABASE IF EXISTS "${dbName}"`);
      await pgClient.end();
    }
  });

  it('should create and verify Cohort entity', async () => {
    const cohortRepo = dataSource.getRepository(Cohort);
    const cohort = cohortRepo.create({
      name: 'Test Cohort',
      targetRampDays: 60,
    });
    const savedCohort = await cohortRepo.save(cohort);
    expect(savedCohort.id).toBeDefined();
    expect(savedCohort.name).toBe('Test Cohort');
    expect(savedCohort.targetRampDays).toBe(60);
    expect(savedCohort.isActive).toBe(true);

    const foundCohort = await cohortRepo.findOne({
      where: { id: savedCohort.id },
      relations: { users: true },
    });
    expect(foundCohort).toBeDefined();
    expect(foundCohort?.isActive).toBe(true);
    expect(foundCohort?.users).toEqual([]);
  });

  it('should create and verify User entity', async () => {
    const cohortRepo = dataSource.getRepository(Cohort);
    const cohort = await cohortRepo.save(
      cohortRepo.create({ name: 'Cohort for User', targetRampDays: 30 }),
    );

    const userRepo = dataSource.getRepository(User);
    const user = userRepo.create({
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.LEARNER,
      level: 2,
      xp: 100,
      streakDays: 5,
      cohortId: cohort.id,
    });
    const savedUser = await userRepo.save(user);
    expect(savedUser.id).toBeDefined();
    expect(savedUser.email).toBe('test@example.com');
    expect(savedUser.name).toBe('Test User');
    expect(savedUser.role).toBe(UserRole.LEARNER);
    expect(savedUser.level).toBe(2);
    expect(savedUser.xp).toBe(100);
    expect(savedUser.streakDays).toBe(5);
    expect(savedUser.cohortId).toBe(cohort.id);

    const foundUser = await userRepo.findOne({
      where: { id: savedUser.id },
      relations: { cohort: true, trackProgresses: true, submissions: true },
    });
    expect(foundUser).toBeDefined();
    expect(foundUser?.cohort.name).toBe('Cohort for User');
    expect(foundUser?.trackProgresses).toEqual([]);
    expect(foundUser?.submissions).toEqual([]);
  });

  it('should create and verify Track and Lesson entities', async () => {
    const trackRepo = dataSource.getRepository(Track);
    const track = trackRepo.create({
      title: 'Test Track',
      description: 'Test Description',
      estimatedTime: '2h',
      icon: 'flag',
      order: 1,
      lessonsCount: 10,
    });
    const savedTrack = await trackRepo.save(track);
    expect(savedTrack.id).toBeDefined();
    expect(savedTrack.title).toBe('Test Track');
    expect(savedTrack.description).toBe('Test Description');
    expect(savedTrack.estimatedTime).toBe('2h');
    expect(savedTrack.icon).toBe('flag');
    expect(savedTrack.order).toBe(1);
    expect(savedTrack.lessonsCount).toBe(10);

    const lessonRepo = dataSource.getRepository(Lesson);
    const lesson = lessonRepo.create({
      trackId: savedTrack.id,
      title: 'Test Lesson',
      order: 1,
      estimatedTime: '30m',
      body: 'Lesson content goes here.',
    });
    const savedLesson = await lessonRepo.save(lesson);
    expect(savedLesson.id).toBeDefined();
    expect(savedLesson.trackId).toBe(savedTrack.id);
    expect(savedLesson.title).toBe('Test Lesson');
    expect(savedLesson.order).toBe(1);
    expect(savedLesson.estimatedTime).toBe('30m');
    expect(savedLesson.body).toBe('Lesson content goes here.');

    const foundTrack = await trackRepo.findOne({
      where: { id: savedTrack.id },
      relations: { lessons: true, progresses: true, exercises: true },
    });
    expect(foundTrack).toBeDefined();
    expect(foundTrack?.lessons.length).toBe(1);
    expect(foundTrack?.lessons[0].title).toBe('Test Lesson');
  });

  it('should create and verify TrackProgress entity', async () => {
    const userRepo = dataSource.getRepository(User);
    const trackRepo = dataSource.getRepository(Track);
    const progressRepo = dataSource.getRepository(TrackProgress);

    const user = await userRepo.save(
      userRepo.create({ email: 'progress@example.com', name: 'Progress User' }),
    );
    const track = await trackRepo.save(
      trackRepo.create({
        title: 'Progress Track',
        description: 'Desc',
        estimatedTime: '1h',
        order: 2,
      }),
    );

    const progress = progressRepo.create({
      userId: user.id,
      trackId: track.id,
      status: ProgressStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
    const savedProgress = await progressRepo.save(progress);
    expect(savedProgress.id).toBeDefined();
    expect(savedProgress.userId).toBe(user.id);
    expect(savedProgress.trackId).toBe(track.id);
    expect(savedProgress.status).toBe(ProgressStatus.IN_PROGRESS);
    expect(savedProgress.lessonsCompleted).toBe(0);
    expect(savedProgress.startedAt).toBeDefined();
    expect(savedProgress.completedAt).toBeNull();

    const foundProgress = await progressRepo.findOne({
      where: { id: savedProgress.id },
      relations: { user: true, track: true },
    });
    expect(foundProgress).toBeDefined();
    expect(foundProgress?.user.id).toBe(user.id);
    expect(foundProgress?.track.id).toBe(track.id);
  });

  it('should create and verify Exercise, Submission, and SubmissionHistory entities', async () => {
    const userRepo = dataSource.getRepository(User);
    const trackRepo = dataSource.getRepository(Track);
    const exerciseRepo = dataSource.getRepository(Exercise);
    const submissionRepo = dataSource.getRepository(Submission);
    const historyRepo = dataSource.getRepository(SubmissionHistory);

    const user = await userRepo.save(
      userRepo.create({
        email: 'submission@example.com',
        name: 'Submitting User',
      }),
    );
    const adminUser = await userRepo.save(
      userRepo.create({
        email: 'admin-eval@example.com',
        name: 'Admin Evaluator',
        role: UserRole.ADMIN,
      }),
    );
    const track = await trackRepo.save(
      trackRepo.create({
        title: 'Submission Track',
        description: 'Desc',
        estimatedTime: '1h',
        order: 3,
      }),
    );

    const exercise = exerciseRepo.create({
      trackId: track.id,
      title: 'Exercise 1',
      tag: 'NestJS',
      difficulty: ExerciseDifficulty.INTERMEDIATE,
      estimatedTime: '2h',
      xp: 100,
      brief: 'Test brief',
      overview: 'Test overview',
      objectives: { goal: 'Test objectives' },
      steps: { step1: 'First step' },
    });
    const savedExercise = await exerciseRepo.save(exercise);
    expect(savedExercise.id).toBeDefined();
    expect(savedExercise.trackId).toBe(track.id);
    expect(savedExercise.title).toBe('Exercise 1');
    expect(savedExercise.tag).toBe('NestJS');
    expect(savedExercise.difficulty).toBe(ExerciseDifficulty.INTERMEDIATE);
    expect(savedExercise.estimatedTime).toBe('2h');
    expect(savedExercise.xp).toBe(100);
    expect(savedExercise.brief).toBe('Test brief');
    expect(savedExercise.overview).toBe('Test overview');
    expect(savedExercise.objectives).toEqual({ goal: 'Test objectives' });
    expect(savedExercise.steps).toEqual({ step1: 'First step' });

    const submission = submissionRepo.create({
      userId: user.id,
      exerciseId: savedExercise.id,
      prUrl: 'https://github.com/test/pull/1',
      status: SubmissionStatus.PENDING,
      submittedAt: new Date(),
    });
    const savedSubmission = await submissionRepo.save(submission);
    expect(savedSubmission.id).toBeDefined();
    expect(savedSubmission.userId).toBe(user.id);
    expect(savedSubmission.exerciseId).toBe(savedExercise.id);
    expect(savedSubmission.prUrl).toBe('https://github.com/test/pull/1');
    expect(savedSubmission.status).toBe(SubmissionStatus.PENDING);
    expect(savedSubmission.submittedAt).toBeDefined();

    const history = historyRepo.create({
      submissionId: savedSubmission.id,
      adminId: adminUser.id,
      action: 'comment',
      comment: 'Nice work!',
    });
    const savedHistory = await historyRepo.save(history);
    expect(savedHistory.id).toBeDefined();
    expect(savedHistory.submissionId).toBe(savedSubmission.id);
    expect(savedHistory.adminId).toBe(adminUser.id);
    expect(savedHistory.action).toBe('comment');
    expect(savedHistory.comment).toBe('Nice work!');

    const foundSubmission = await submissionRepo.findOne({
      where: { id: savedSubmission.id },
      relations: { user: true, exercise: true, histories: true },
    });
    expect(foundSubmission).toBeDefined();
    expect(foundSubmission?.user.id).toBe(user.id);
    expect(foundSubmission?.exercise.id).toBe(savedExercise.id);
    expect(foundSubmission?.histories.length).toBe(1);
    expect(foundSubmission?.histories[0].id).toBe(savedHistory.id);

    const foundHistory = await historyRepo.findOne({
      where: { id: savedHistory.id },
      relations: { submission: true, admin: true },
    });
    expect(foundHistory).toBeDefined();
    expect(foundHistory?.submission.id).toBe(savedSubmission.id);
    expect(foundHistory?.admin.id).toBe(adminUser.id);
  });

  it('should create and verify Tag and Document entities (ManyToMany)', async () => {
    const tagRepo = dataSource.getRepository(Tag);
    const docRepo = dataSource.getRepository(Document);

    const tag1 = await tagRepo.save(tagRepo.create({ name: 'TypeScript' }));
    const tag2 = await tagRepo.save(tagRepo.create({ name: 'TypeORM' }));

    const doc = docRepo.create({
      title: 'Documentation Title',
      content: 'This is the body of the document.',
      url: 'https://example.com/docs',
      tags: [tag1, tag2],
    });
    const savedDoc = await docRepo.save(doc);
    expect(savedDoc.id).toBeDefined();
    expect(savedDoc.title).toBe('Documentation Title');
    expect(savedDoc.content).toBe('This is the body of the document.');
    expect(savedDoc.url).toBe('https://example.com/docs');
    expect(savedDoc.tags.length).toBe(2);

    const foundDoc = await docRepo.findOne({
      where: { id: savedDoc.id },
      relations: { tags: true },
    });
    expect(foundDoc).toBeDefined();
    expect(foundDoc?.tags.length).toBe(2);
    const tagNames = foundDoc?.tags.map((t) => t.name) || [];
    expect(tagNames).toContain('TypeScript');
    expect(tagNames).toContain('TypeORM');

    const foundTag = await tagRepo.findOne({
      where: { id: tag1.id },
      relations: { documents: true },
    });
    expect(foundTag).toBeDefined();
    expect(foundTag?.documents.length).toBe(1);
    expect(foundTag?.documents[0].title).toBe('Documentation Title');
  });

  it('should create and verify User bookmarking a Document (ManyToMany)', async () => {
    const userRepo = dataSource.getRepository(User);
    const docRepo = dataSource.getRepository(Document);

    const user = await userRepo.save(
      userRepo.create({
        email: 'bookmark-test@example.com',
        name: 'Bookmark Tester',
      }),
    );

    const doc1 = await docRepo.save(
      docRepo.create({
        title: 'Bookmarked Document',
        url: 'https://example.com/bookmarked',
      }),
    );

    // Add bookmark
    user.bookmarkedDocuments = [doc1];
    await userRepo.save(user);

    // Verify
    const foundUser = await userRepo.findOne({
      where: { id: user.id },
      relations: { bookmarkedDocuments: true },
    });
    expect(foundUser).toBeDefined();
    expect(foundUser?.bookmarkedDocuments.length).toBe(1);
    expect(foundUser?.bookmarkedDocuments[0].title).toBe('Bookmarked Document');

    const foundDoc1 = await docRepo.findOne({
      where: { id: doc1.id },
      relations: { bookmarkedBy: true },
    });
    expect(foundDoc1).toBeDefined();
    expect(foundDoc1?.bookmarkedBy.length).toBe(1);
    expect(foundDoc1?.bookmarkedBy[0].email).toBe('bookmark-test@example.com');
  });

  it('should create and verify Notification entity', async () => {
    const userRepo = dataSource.getRepository(User);
    const notificationRepo = dataSource.getRepository(Notification);

    const user = await userRepo.save(
      userRepo.create({
        email: 'notify-test@example.com',
        name: 'Notify Tester',
      }),
    );

    const notification = notificationRepo.create({
      userId: user.id,
      type: 'track_unlocked',
      title: 'New track unlocked',
      body: 'System Architecture is now available',
      read: false,
    });
    const savedNotification = await notificationRepo.save(notification);
    expect(savedNotification.id).toBeDefined();
    expect(savedNotification.userId).toBe(user.id);
    expect(savedNotification.type).toBe('track_unlocked');
    expect(savedNotification.title).toBe('New track unlocked');
    expect(savedNotification.body).toBe('System Architecture is now available');
    expect(savedNotification.read).toBe(false);

    const foundNotification = await notificationRepo.findOne({
      where: { id: savedNotification.id },
      relations: { user: true },
    });
    expect(foundNotification).toBeDefined();
    expect(foundNotification?.user.id).toBe(user.id);
  });
});

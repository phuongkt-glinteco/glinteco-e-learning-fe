import AppDataSource from '../data-source';
import {
  Cohort,
  Document,
  Exercise,
  ExerciseDifficulty,
  Lesson,
  ProgressStatus,
  Submission,
  SubmissionHistory,
  SubmissionStatus,
  Tag,
  Track,
  TrackProgress,
  User,
  UserRole,
} from '../entities';

/**
 * Seeds the database with representative mock data for local development and
 * testing. The script is idempotent: it truncates every table before
 * inserting, so it can be run repeatedly without producing duplicates.
 *
 * Run with: `pnpm run seed`
 */
async function seed(): Promise<void> {
  const dataSource = await AppDataSource.initialize();
  console.log('🔌 Data source initialised. Seeding database...');

  try {
    // Wipe existing data so the seed is repeatable.
    await dataSource.query(
      `TRUNCATE TABLE
        "submission_histories",
        "submissions",
        "track_progresses",
        "document_tags",
        "documents",
        "tags",
        "exercises",
        "lessons",
        "tracks",
        "users",
        "cohorts"
      RESTART IDENTITY CASCADE`,
    );

    // --- Cohorts ---------------------------------------------------------
    const cohortRepo = dataSource.getRepository(Cohort);
    const cohort = await cohortRepo.save(
      cohortRepo.create({ name: 'RAMP UP 2026 - Batch 1', targetRampDays: 60 }),
    );

    // --- Users -----------------------------------------------------------
    const userRepo = dataSource.getRepository(User);
    const admin = await userRepo.save(
      userRepo.create({
        email: 'admin@glinteco.com',
        name: 'Admin Glinteco',
        role: UserRole.ADMIN,
        level: 10,
        xp: 9999,
        streakDays: 30,
      }),
    );
    const [alice, bob] = await userRepo.save([
      userRepo.create({
        email: 'alice@glinteco.com',
        name: 'Alice Nguyen',
        role: UserRole.LEARNER,
        level: 3,
        xp: 450,
        streakDays: 7,
        cohortId: cohort.id,
      }),
      userRepo.create({
        email: 'bob@glinteco.com',
        name: 'Bob Tran',
        role: UserRole.LEARNER,
        level: 1,
        xp: 80,
        streakDays: 2,
        cohortId: cohort.id,
      }),
    ]);

    // --- Tracks + Lessons + Exercises -----------------------------------
    const trackRepo = dataSource.getRepository(Track);
    const lessonRepo = dataSource.getRepository(Lesson);
    const exerciseRepo = dataSource.getRepository(Exercise);

    const onboardingTrack = await trackRepo.save(
      trackRepo.create({
        name: 'Onboarding & Tooling',
        order: 1,
        lessonsCount: 2,
      }),
    );
    const backendTrack = await trackRepo.save(
      trackRepo.create({
        name: 'Backend with NestJS',
        order: 2,
        lessonsCount: 2,
      }),
    );

    await lessonRepo.save([
      lessonRepo.create({
        trackId: onboardingTrack.id,
        name: 'Setup môi trường phát triển',
        order: 1,
        content: 'Cài đặt Node.js, pnpm, Docker và clone repository dự án.',
      }),
      lessonRepo.create({
        trackId: onboardingTrack.id,
        name: 'Git workflow & quy ước commit',
        order: 2,
        content:
          'Tìm hiểu branch strategy, conventional commits và quy trình review.',
      }),
      lessonRepo.create({
        trackId: backendTrack.id,
        name: 'NestJS Modules & Dependency Injection',
        order: 1,
        content:
          'Cấu trúc module, provider và cơ chế tiêm phụ thuộc trong NestJS.',
      }),
      lessonRepo.create({
        trackId: backendTrack.id,
        name: 'TypeORM & PostgreSQL',
        order: 2,
        content:
          'Định nghĩa entity, migration và truy vấn dữ liệu với TypeORM.',
      }),
    ]);

    const exercise = await exerciseRepo.save(
      exerciseRepo.create({
        trackId: backendTrack.id,
        title: 'Xây dựng REST API quản lý người dùng',
        tag: 'backend',
        difficulty: ExerciseDifficulty.BEGINNER,
        estimatedTime: '2 hours',
        xp: 200,
        brief: 'Xây dựng module User trong NestJS',
        overview: 'Trong bài tập này, bạn sẽ thực hiện viết REST API cho User và tích hợp cơ sở dữ liệu.',
        objectives: [
          'Tạo module User với controller và service',
          'Triển khai cursor pagination cho endpoint danh sách',
        ],
        steps: [
          'Khởi tạo NestJS module',
          'Định nghĩa DTO và validation',
          'Viết unit test cho service',
        ],
      }),
    );

    // --- Track progress --------------------------------------------------
    const progressRepo = dataSource.getRepository(TrackProgress);
    await progressRepo.save([
      progressRepo.create({
        userId: alice.id,
        trackId: onboardingTrack.id,
        status: ProgressStatus.COMPLETED,
        startedAt: new Date('2026-06-01T09:00:00Z'),
        completedAt: new Date('2026-06-05T17:00:00Z'),
      }),
      progressRepo.create({
        userId: alice.id,
        trackId: backendTrack.id,
        status: ProgressStatus.IN_PROGRESS,
        startedAt: new Date('2026-06-06T09:00:00Z'),
      }),
      progressRepo.create({
        userId: bob.id,
        trackId: onboardingTrack.id,
        status: ProgressStatus.IN_PROGRESS,
        startedAt: new Date('2026-06-10T09:00:00Z'),
      }),
    ]);

    // --- Submissions + history ------------------------------------------
    const submissionRepo = dataSource.getRepository(Submission);
    const historyRepo = dataSource.getRepository(SubmissionHistory);

    const submission = await submissionRepo.save(
      submissionRepo.create({
        userId: alice.id,
        exerciseId: exercise.id,
        prUrl:
          'https://github.com/phuongkt-glinteco/glinteco-e-learning-fe/pull/42',
        status: SubmissionStatus.APPROVED,
        submittedAt: new Date('2026-06-12T10:30:00Z'),
      }),
    );

    await historyRepo.save([
      historyRepo.create({
        submissionId: submission.id,
        adminId: admin.id,
        action: 'request_changes',
        comment: 'Bổ sung unit test cho service trước khi merge.',
      }),
      historyRepo.create({
        submissionId: submission.id,
        adminId: admin.id,
        action: 'approve',
        comment: 'Code đạt yêu cầu, đã approve. Good job!',
      }),
    ]);

    // --- Documents + Tags (many-to-many) --------------------------------
    const tagRepo = dataSource.getRepository(Tag);
    const documentRepo = dataSource.getRepository(Document);

    const [nestjsTag, dbTag, gitTag] = await tagRepo.save([
      tagRepo.create({ name: 'nestjs' }),
      tagRepo.create({ name: 'database' }),
      tagRepo.create({ name: 'git' }),
    ]);

    await documentRepo.save([
      documentRepo.create({
        title: 'Hướng dẫn cấu trúc dự án NestJS',
        content: 'Tài liệu mô tả cách tổ chức module, controller và service.',
        url: 'https://docs.nestjs.com/',
        tags: [nestjsTag],
      }),
      documentRepo.create({
        title: 'TypeORM Migration Best Practices',
        content:
          'Quy ước viết và chạy migration an toàn trên môi trường production.',
        url: 'https://typeorm.io/migrations',
        tags: [nestjsTag, dbTag],
      }),
      documentRepo.create({
        title: 'Git Workflow tại Glinteco',
        content:
          'Branch strategy, conventional commits và quy trình code review.',
        tags: [gitTag],
      }),
    ]);

    console.log('✅ Seeding completed successfully.');
    console.log(
      `   Inserted: 1 cohort, 3 users, 2 tracks, 4 lessons, 1 exercise, ` +
        `3 track progresses, 1 submission, 2 history entries, 3 documents, 3 tags.`,
    );
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await dataSource.destroy();
  }
}

void seed();

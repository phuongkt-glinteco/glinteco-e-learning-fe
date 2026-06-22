import * as bcrypt from 'bcryptjs';
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
      cohortRepo.create({ name: 'RAMP UP 2026 - Batch 1', targetRampDays: 14 }),
    );

    // --- Users -----------------------------------------------------------
    const userRepo = dataSource.getRepository(User);
    const passwordHash = await bcrypt.hash('rampup123', 10);

    const admin = await userRepo.save(
      userRepo.create({
        email: 'admin@glinteco.com',
        name: 'Devs Lead',
        role: UserRole.ADMIN,
        password: passwordHash,
        level: 9,
        xp: 9800,
        streakDays: 30,
      }),
    );

    const [alice, bob] = await userRepo.save([
      userRepo.create({
        email: 'alice@glinteco.com',
        name: 'Mina Okonkwo',
        title: 'Frontend Engineer',
        role: UserRole.LEARNER,
        password: passwordHash,
        level: 3,
        xp: 1240,
        streakDays: 6,
        cohortId: cohort.id,
        avatarHue: 162,
      }),
      userRepo.create({
        email: 'bob@glinteco.com',
        name: 'Bob Tran',
        title: 'Junior Developer',
        role: UserRole.LEARNER,
        password: passwordHash,
        level: 1,
        xp: 80,
        streakDays: 2,
        cohortId: cohort.id,
        avatarHue: 40,
      }),
    ]);

    // --- Tracks + Lessons + Exercises -----------------------------------
    const trackRepo = dataSource.getRepository(Track);
    const lessonRepo = dataSource.getRepository(Lesson);
    const exerciseRepo = dataSource.getRepository(Exercise);

    // Seed 5 tracks
    const t1 = await trackRepo.save(
      trackRepo.create({
        title: 'Local Dev Environment',
        description: 'Setup local development environment, git flow, and coding standards.',
        estimatedTime: '2h',
        icon: 'flag',
        order: 1,
        lessonsCount: 4,
      }),
    );
    const t2 = await trackRepo.save(
      trackRepo.create({
        title: 'Frontend Fundamentals',
        description: 'Learn React, TypeScript, Tailwind CSS, and build responsive components.',
        estimatedTime: '4h',
        icon: 'code',
        order: 2,
        lessonsCount: 6,
      }),
    );
    const t3 = await trackRepo.save(
      trackRepo.create({
        title: 'NestJS Service Layer',
        description: 'Build robust backend services, controllers, DTOs, and connect to PostgreSQL.',
        estimatedTime: '6h',
        icon: 'server',
        order: 3,
        lessonsCount: 5,
      }),
    );
    const t4 = await trackRepo.save(
      trackRepo.create({
        title: 'System Architecture',
        description: 'Design microservices, gateway pattern, events, and sequence flows.',
        estimatedTime: '3h',
        icon: 'sitemap',
        order: 4,
        lessonsCount: 4,
      }),
    );
    const t5 = await trackRepo.save(
      trackRepo.create({
        title: 'Testing & CI Pipeline',
        description: 'Write unit tests, integration tests, E2E tests, and run CI/CD gates.',
        estimatedTime: '3h',
        icon: 'shield',
        order: 5,
        lessonsCount: 3,
      }),
    );

    // Seed Lessons
    await lessonRepo.save([
      // T1
      lessonRepo.create({
        trackId: t1.id,
        title: 'Clone the Monorepo',
        order: 1,
        estimatedTime: '15m',
        body: 'Clone the git monorepo locally and checkout your branch.',
      }),
      lessonRepo.create({
        trackId: t1.id,
        title: 'Install pnpm & Tooling',
        order: 2,
        estimatedTime: '20m',
        body: 'Install node, pnpm and configure workspace dependencies.',
      }),
      lessonRepo.create({
        trackId: t1.id,
        title: 'Running with Docker Compose',
        order: 3,
        estimatedTime: '25m',
        body: 'Run postgres and redis containers locally via compose.',
      }),
      lessonRepo.create({
        trackId: t1.id,
        title: 'Verification Checkpoint',
        order: 4,
        estimatedTime: '15m',
        body: 'Verify all services are up and you can load the app locally.',
      }),

      // T2
      lessonRepo.create({
        trackId: t2.id,
        title: 'Next.js App Router Structure',
        order: 1,
        estimatedTime: '30m',
        body: 'Learn layouts, pages, loading states, and parallel routing.',
      }),
      lessonRepo.create({
        trackId: t2.id,
        title: 'Tailoring Tailwind CSS',
        order: 2,
        estimatedTime: '30m',
        body: 'Configure config, utilities, and custom spacing systems.',
      }),
      lessonRepo.create({
        trackId: t2.id,
        title: 'Shared Component Library',
        order: 3,
        estimatedTime: '30m',
        body: 'Import and configure global design tokens and assets.',
      }),
      lessonRepo.create({
        trackId: t2.id,
        title: 'Accessibility Standards',
        order: 4,
        estimatedTime: '30m',
        body: 'ARIA landmarks, screen readers, contrast, and focus states.',
      }),
      lessonRepo.create({
        trackId: t2.id,
        title: 'Design Tokens & Layouts',
        order: 5,
        estimatedTime: '30m',
        body: 'Apply premium margins, sizing constraints, and dynamic tokens.',
      }),
      lessonRepo.create({
        trackId: t2.id,
        title: 'Building Reusable React Components',
        order: 6,
        estimatedTime: '30m',
        body: 'Implement composite widgets using premium clean design codes.',
      }),

      // T3
      lessonRepo.create({
        trackId: t3.id,
        title: 'Modules & Providers in NestJS',
        order: 1,
        estimatedTime: '30m',
        body: 'Configure dependency injection, module boundaries and imports.',
      }),
      lessonRepo.create({
        trackId: t3.id,
        title: 'Controller & Routing Layers',
        order: 2,
        estimatedTime: '30m',
        body: 'Write REST endpoints with Swagger docs and HTTP status codes.',
      }),
      lessonRepo.create({
        trackId: t3.id,
        title: 'Request DTOs & Validation',
        order: 3,
        estimatedTime: '30m',
        body: 'Apply class-validator constraints and DTO validation rules.',
      }),
      lessonRepo.create({
        trackId: t3.id,
        title: 'Database Integration with TypeORM',
        order: 4,
        estimatedTime: '30m',
        body: 'Map relations, specify repositories and create entity migrations.',
      }),
      lessonRepo.create({
        trackId: t3.id,
        title: 'Pagination & Service Methods',
        order: 5,
        estimatedTime: '30m',
        body: 'Implement keyset cursor pagination to deliver stable feeds.',
      }),

      // T4
      lessonRepo.create({
        trackId: t4.id,
        title: 'Event-Driven Boundaries',
        order: 1,
        estimatedTime: '30m',
        body: 'Implement event-emitters to decouple notification pipelines.',
      }),
      lessonRepo.create({
        trackId: t4.id,
        title: 'Gateway Pattern Setup',
        order: 2,
        estimatedTime: '30m',
        body: 'Structure clean API proxies with reverse proxy services.',
      }),
      lessonRepo.create({
        trackId: t4.id,
        title: 'Contract Definitions',
        order: 3,
        estimatedTime: '30m',
        body: 'Establish type contracts for events and service pipelines.',
      }),
      lessonRepo.create({
        trackId: t4.id,
        title: 'Order Flow Sequence',
        order: 4,
        estimatedTime: '30m',
        body: 'Map events from checkout up to package fulfillment.',
      }),

      // T5
      lessonRepo.create({
        trackId: t5.id,
        title: 'Unit testing with Jest',
        order: 1,
        estimatedTime: '30m',
        body: 'Mock repositories and verify service method logic.',
      }),
      lessonRepo.create({
        trackId: t5.id,
        title: 'Integration test setup',
        order: 2,
        estimatedTime: '30m',
        body: 'Write supertest specifications targeting controller routes.',
      }),
      lessonRepo.create({
        trackId: t5.id,
        title: 'Playwright and CI pipelines',
        order: 3,
        estimatedTime: '30m',
        body: 'Automate browser tests and check status gate thresholds.',
      }),
    ]);

    // Seed Exercises
    const e1 = await exerciseRepo.save(
      exerciseRepo.create({
        trackId: t2.id,
        title: 'Build a Profile Card Component',
        tag: 'Frontend',
        difficulty: ExerciseDifficulty.BEGINNER,
        estimatedTime: '2 hours',
        xp: 120,
        brief: 'Create a reusable <ProfileCard/> using our component library tokens. Must be responsive and pass a11y lint.',
        overview: 'Engineers reach for shared primitives constantly. This task gets you fluent with our design tokens, the component library API, and the a11y lint gate.',
        objectives: [
          'Render avatar, name, role and a status dot from props',
          'Use only design tokens — no hard-coded colors or spacing',
          'Responsive from 320px up; no horizontal scroll',
          'Passes pnpm lint:a11y with zero violations',
        ],
        steps: [
          'Scaffold the component under packages/ui/src/ProfileCard',
          'Wire props + Storybook story with 3 states',
          'Add a unit test for the status-dot color mapping',
          'Open a PR and paste the link below',
        ],
      }),
    );

    const e2 = await exerciseRepo.save(
      exerciseRepo.create({
        trackId: t3.id,
        title: 'Add a Paginated Users Endpoint',
        tag: 'NestJS',
        difficulty: ExerciseDifficulty.INTERMEDIATE,
        estimatedTime: '3 hours',
        xp: 200,
        brief: 'Implement GET /users with cursor pagination, DTO validation, and a unit test for the service.',
        overview: 'Cursor pagination is our standard for every list endpoint. You will build one end-to-end: controller, service, DTO validation, and a unit test.',
        objectives: [
          'GET /users accepts ?cursor and ?limit (max 50)',
          'Response includes nextCursor and hasMore',
          'Invalid params return 400 via class-validator DTO',
          'Service unit test covers empty, partial and full pages',
        ],
        steps: [
          'Add the PaginationQueryDto with validation decorators',
          'Implement keyset pagination in UsersService.list()',
          'Write the Jest spec for the service',
          'Open a PR and paste the link below',
        ],
      }),
    );

    const e3 = await exerciseRepo.save(
      exerciseRepo.create({
        trackId: t4.id,
        title: 'Diagram the Order Flow',
        tag: 'Architecture',
        difficulty: ExerciseDifficulty.ADVANCED,
        estimatedTime: '2 hours',
        xp: 160,
        brief: 'Document the event flow from checkout to fulfillment. Submit a branch with the .md + mermaid diagram.',
        overview: 'Before touching the order domain, every engineer maps it. You will trace the events and capture the contract boundaries.',
        objectives: [
          'Sequence diagram from checkout -> payment -> fulfillment',
          'Every arrow names the event on the bus',
          'Call out at least one failure / retry path',
          'Committed as Markdown + mermaid under /docs/architecture',
        ],
        steps: [
          'Skim the event bus contract registry',
          'Draft the mermaid sequence diagram',
          'Annotate failure handling + idempotency keys',
          'Open a branch PR and paste the link below',
        ],
      }),
    );

    // --- Track progress --------------------------------------------------
    const progressRepo = dataSource.getRepository(TrackProgress);
    await progressRepo.save([
      progressRepo.create({
        userId: alice.id,
        trackId: t1.id,
        status: ProgressStatus.COMPLETED,
        startedAt: new Date('2026-06-01T09:00:00Z'),
        completedAt: new Date('2026-06-05T17:00:00Z'),
        lessonsCompleted: 4,
      }),
      progressRepo.create({
        userId: alice.id,
        trackId: t2.id,
        status: ProgressStatus.COMPLETED,
        startedAt: new Date('2026-06-06T09:00:00Z'),
        completedAt: new Date('2026-06-10T17:00:00Z'),
        lessonsCompleted: 6,
      }),
      progressRepo.create({
        userId: alice.id,
        trackId: t3.id,
        status: ProgressStatus.IN_PROGRESS,
        startedAt: new Date('2026-06-11T09:00:00Z'),
        lessonsCompleted: 3,
      }),
      progressRepo.create({
        userId: bob.id,
        trackId: t1.id,
        status: ProgressStatus.IN_PROGRESS,
        startedAt: new Date('2026-06-10T09:00:00Z'),
        lessonsCompleted: 1,
      }),
    ]);

    // --- Submissions + history ------------------------------------------
    const submissionRepo = dataSource.getRepository(Submission);
    const historyRepo = dataSource.getRepository(SubmissionHistory);

    // Alice approved submission for E1
    const sub1 = await submissionRepo.save(
      submissionRepo.create({
        userId: alice.id,
        exerciseId: e1.id,
        prUrl: 'https://github.com/acme/web/pull/482',
        status: SubmissionStatus.APPROVED,
        submittedAt: new Date('2026-06-09T10:30:00Z'),
      }),
    );

    await historyRepo.save([
      historyRepo.create({
        submissionId: sub1.id,
        adminId: admin.id,
        action: 'approved',
        comment: 'Great job on the component structure and tokens! Passes a11y cleanly.',
      }),
    ]);

    // Alice pending submission for E2
    const sub2 = await submissionRepo.save(
      submissionRepo.create({
        userId: alice.id,
        exerciseId: e2.id,
        prUrl: 'https://github.com/acme/api/pull/119',
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date('2026-06-12T14:20:00Z'),
      }),
    );

    await historyRepo.save([
      historyRepo.create({
        submissionId: sub2.id,
        adminId: null,
        action: 'submitted',
        prUrl: 'https://github.com/acme/api/pull/119',
        comment: '',
      }),
    ]);

    // --- Documents + Tags (many-to-many) --------------------------------
    const tagRepo = dataSource.getRepository(Tag);
    const documentRepo = dataSource.getRepository(Document);

    const [nestjsTag, dbTag, gitTag, feTag, archTag, testingTag] = await tagRepo.save([
      tagRepo.create({ name: 'NestJS' }),
      tagRepo.create({ name: 'Database' }),
      tagRepo.create({ name: 'Git' }),
      tagRepo.create({ name: 'Frontend' }),
      tagRepo.create({ name: 'Architecture' }),
      tagRepo.create({ name: 'Testing' }),
    ]);

    await documentRepo.save([
      documentRepo.create({
        title: 'Next.js App Router Conventions',
        content: 'Learn layouts, pages, loading states, and parallel routing.',
        url: 'wiki/frontend/app-router',
        tags: [feTag, archTag],
        kind: 'Guide',
      }),
      documentRepo.create({
        title: 'Component Library Storybook',
        content: 'Check our design tokens and global widget assets.',
        url: 'storybook.internal.dev',
        tags: [feTag],
        kind: 'Reference',
      }),
      documentRepo.create({
        title: 'NestJS Module Boundaries',
        content: 'Guidelines on module decoupling and dependency injection.',
        url: 'wiki/backend/modules',
        tags: [nestjsTag, archTag],
        kind: 'Guide',
      }),
      documentRepo.create({
        title: 'Database Migration Playbook',
        content: 'Writing safe TypeORM entity migrations for live databases.',
        url: 'wiki/data/migrations',
        tags: [dbTag],
        kind: 'Runbook',
      }),
      documentRepo.create({
        title: 'Service Auth & JWT Flow',
        content: 'Authentication logic, session management, and Guard structures.',
        url: 'wiki/backend/auth',
        tags: [nestjsTag, archTag],
        kind: 'Guide',
      }),
    ]);

    console.log('✅ Seeding completed successfully.');
    console.log(
      `   Inserted: 1 cohort, 3 users, 5 tracks, 22 lessons, 3 exercises, ` +
        `4 track progresses, 2 submissions, 2 history entries, 5 documents, 6 tags.`,
    );
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await dataSource.destroy();
  }
}

void seed();

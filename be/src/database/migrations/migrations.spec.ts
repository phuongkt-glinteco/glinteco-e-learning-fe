/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Client } from 'pg';
import { DataSource } from 'typeorm';
import { InitialSchema1781611485949 } from './1781611485949-InitialSchema';
import { AddGoogleIdToUsers1781616508023 } from './1781616508023-AddGoogleIdToUsers';
import { UpdateSubmissionStatusEnum1781617000000 } from './1781617000000-UpdateSubmissionStatusEnum';
import { AddTrackOrderIndex1781617100000 } from './1781617100000-AddTrackOrderIndex';
import { AddKindToDocumentsAndSearchIndexes1781617508000 } from './1781617508000-AddKindToDocumentsAndSearchIndexes';
import { AddExerciseDetails1781622361007 } from './1781622361007-AddExerciseDetails';
import { AddUserBookmarks1781623541186 } from './1781623541186-AddUserBookmarks';
import { AddIsActiveToCohorts1781624224625 } from './1781624224625-AddIsActiveToCohorts';
import { AddLessonsCompletedToTrackProgress1781628751000 } from './1781628751000-AddLessonsCompletedToTrackProgress';
import { UpdateTracksAndLessonsSchema1784400000000 } from './1784400000000-UpdateTracksAndLessonsSchema';

describe('Database Migrations', () => {
  let pgClient: Client;
  let dataSource: DataSource;
  const dbName = 'rampup_test_migration';

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
      synchronize: false,
      logging: false,
    });
    await dataSource.initialize();
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

  it('should run up and down migrations successfully', async () => {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    const migration1 = new InitialSchema1781611485949();
    const migration2 = new AddGoogleIdToUsers1781616508023();
    const migration3 = new UpdateSubmissionStatusEnum1781617000000();
    const migrationTrackOrder = new AddTrackOrderIndex1781617100000();
    const migration4 = new AddKindToDocumentsAndSearchIndexes1781617508000();
    const migration5 = new AddExerciseDetails1781622361007();
    const migration6 = new AddUserBookmarks1781623541186();
    const migration7 = new AddIsActiveToCohorts1781624224625();
    const migration8 = new AddLessonsCompletedToTrackProgress1781628751000();
    const migration9 = new UpdateTracksAndLessonsSchema1784400000000();

    // Run UP 1
    await migration1.up(queryRunner);
    expect(await queryRunner.hasTable('users')).toBe(true);
    expect(await queryRunner.hasTable('cohorts')).toBe(true);
    expect(await queryRunner.hasColumn('users', 'google_id')).toBe(false);
    expect(await queryRunner.hasColumn('cohorts', 'isActive')).toBe(false);

    // Run UP 2
    await migration2.up(queryRunner);
    expect(await queryRunner.hasColumn('users', 'google_id')).toBe(true);
    expect(await queryRunner.hasColumn('documents', 'kind')).toBe(false);

    // Run UP 3
    await migration3.up(queryRunner);
    const enumValues = await queryRunner.query(
      `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public.submissions_status_enum'::regtype::oid`,
    );
    const labels = enumValues.map(
      (row: { enumlabel: string }) => row.enumlabel,
    );
    expect(labels).toContain('submitted');
    expect(labels).toContain('changes');

    // Run UP Track Order Index
    await migrationTrackOrder.up(queryRunner);
    const indexResult = await queryRunner.query(
      `SELECT indexname FROM pg_indexes WHERE tablename = 'tracks' AND indexname = 'IDX_tracks_track_order'`,
    );
    expect(indexResult.length).toBe(1);

    // Run UP 4
    await migration4.up(queryRunner);
    expect(await queryRunner.hasColumn('documents', 'kind')).toBe(true);
    expect(await queryRunner.hasTable('user_bookmarks')).toBe(false);

    // Run UP 5
    await migration5.up(queryRunner);
    expect(await queryRunner.hasColumn('exercises', 'difficulty')).toBe(true);
    expect(await queryRunner.hasTable('exercise_documents')).toBe(true);

    // Run UP 6
    await migration6.up(queryRunner);
    expect(await queryRunner.hasTable('user_bookmarks')).toBe(true);
    expect(await queryRunner.hasColumn('cohorts', 'isActive')).toBe(false);

    // Run UP 7
    await migration7.up(queryRunner);
    expect(await queryRunner.hasColumn('cohorts', 'isActive')).toBe(true);
    expect(
      await queryRunner.hasColumn('track_progresses', 'lessonsCompleted'),
    ).toBe(false);

    // Run UP 8
    await migration8.up(queryRunner);
    expect(
      await queryRunner.hasColumn('track_progresses', 'lessonsCompleted'),
    ).toBe(true);

    // Run UP 9
    await migration9.up(queryRunner);
    expect(await queryRunner.hasColumn('tracks', 'title')).toBe(true);
    expect(await queryRunner.hasColumn('tracks', 'name')).toBe(false);
    expect(await queryRunner.hasColumn('tracks', 'description')).toBe(true);
    expect(await queryRunner.hasColumn('tracks', 'estimatedTime')).toBe(true);
    expect(await queryRunner.hasColumn('tracks', 'icon')).toBe(true);
    expect(await queryRunner.hasColumn('lessons', 'title')).toBe(true);
    expect(await queryRunner.hasColumn('lessons', 'name')).toBe(false);
    expect(await queryRunner.hasColumn('lessons', 'body')).toBe(true);
    expect(await queryRunner.hasColumn('lessons', 'content')).toBe(false);
    expect(await queryRunner.hasColumn('lessons', 'estimatedTime')).toBe(true);

    // Run DOWN 9
    await migration9.down(queryRunner);
    expect(await queryRunner.hasColumn('tracks', 'title')).toBe(false);
    expect(await queryRunner.hasColumn('tracks', 'name')).toBe(true);
    expect(await queryRunner.hasColumn('lessons', 'title')).toBe(false);
    expect(await queryRunner.hasColumn('lessons', 'name')).toBe(true);

    // Run DOWN 8
    await migration8.down(queryRunner);
    expect(
      await queryRunner.hasColumn('track_progresses', 'lessonsCompleted'),
    ).toBe(false);

    // Run DOWN 7
    await migration7.down(queryRunner);
    expect(await queryRunner.hasColumn('cohorts', 'isActive')).toBe(false);

    // Run DOWN 6
    await migration6.down(queryRunner);
    expect(await queryRunner.hasTable('user_bookmarks')).toBe(false);

    // Run DOWN 5
    await migration5.down(queryRunner);
    expect(await queryRunner.hasColumn('exercises', 'difficulty')).toBe(false);
    expect(await queryRunner.hasTable('exercise_documents')).toBe(false);

    // Run DOWN 4
    await migration4.down(queryRunner);
    expect(await queryRunner.hasColumn('documents', 'kind')).toBe(false);

    // Run DOWN Track Order Index
    await migrationTrackOrder.down(queryRunner);
    const indexResultAfterDown = await queryRunner.query(
      `SELECT indexname FROM pg_indexes WHERE tablename = 'tracks' AND indexname = 'IDX_tracks_track_order'`,
    );
    expect(indexResultAfterDown.length).toBe(0);

    // Run DOWN 3
    await migration3.down(queryRunner);
    const enumValuesAfterDown = await queryRunner.query(
      `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public.submissions_status_enum'::regtype::oid`,
    );
    const labelsAfterDown = enumValuesAfterDown.map(
      (row: { enumlabel: string }) => row.enumlabel,
    );
    expect(labelsAfterDown).not.toContain('submitted');
    expect(labelsAfterDown).not.toContain('changes');

    // Run DOWN 2
    await migration2.down(queryRunner);
    expect(await queryRunner.hasColumn('users', 'google_id')).toBe(false);

    // Run DOWN 1
    await migration1.down(queryRunner);
    expect(await queryRunner.hasTable('users')).toBe(false);
    expect(await queryRunner.hasTable('cohorts')).toBe(false);

    await queryRunner.release();
  });
});

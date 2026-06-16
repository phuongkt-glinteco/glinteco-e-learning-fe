/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Client } from 'pg';
import { DataSource } from 'typeorm';
import { InitialSchema1781611485949 } from './1781611485949-InitialSchema';
import { AddGoogleIdToUsers1781616508023 } from './1781616508023-AddGoogleIdToUsers';
import { AddExerciseDetails1781622361007 } from './1781622361007-AddExerciseDetails';

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
    const migration3 = new AddExerciseDetails1781622361007();

    // Run UP 1
    await migration1.up(queryRunner);
    expect(await queryRunner.hasTable('users')).toBe(true);
    expect(await queryRunner.hasTable('cohorts')).toBe(true);
    expect(await queryRunner.hasColumn('users', 'google_id')).toBe(false);

    // Run UP 2
    await migration2.up(queryRunner);
    expect(await queryRunner.hasColumn('users', 'google_id')).toBe(true);

    // Run UP 3
    await migration3.up(queryRunner);
    expect(await queryRunner.hasColumn('exercises', 'difficulty')).toBe(true);
    expect(await queryRunner.hasTable('exercise_documents')).toBe(true);

    // Run DOWN 3
    await migration3.down(queryRunner);
    expect(await queryRunner.hasColumn('exercises', 'difficulty')).toBe(false);
    expect(await queryRunner.hasTable('exercise_documents')).toBe(false);

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

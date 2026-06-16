/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Client } from 'pg';
import { DataSource } from 'typeorm';
import { InitialSchema1781611485949 } from './1781611485949-InitialSchema';

describe('InitialSchema1781611485949 Migration', () => {
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

  it('should run up and down migration successfully', async () => {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    const migration = new InitialSchema1781611485949();

    // Run UP
    await migration.up(queryRunner);

    // Verify some tables are created
    const hasUsersTable = await queryRunner.hasTable('users');
    const hasCohortsTable = await queryRunner.hasTable('cohorts');
    expect(hasUsersTable).toBe(true);
    expect(hasCohortsTable).toBe(true);

    // Run DOWN
    await migration.down(queryRunner);

    // Verify tables are dropped
    const hasUsersTableAfter = await queryRunner.hasTable('users');
    const hasCohortsTableAfter = await queryRunner.hasTable('cohorts');
    expect(hasUsersTableAfter).toBe(false);
    expect(hasCohortsTableAfter).toBe(false);

    await queryRunner.release();
  });
});

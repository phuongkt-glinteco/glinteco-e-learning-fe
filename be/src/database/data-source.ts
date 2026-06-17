import 'dotenv/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Standalone TypeORM DataSource used by the TypeORM CLI for migrations and by
 * the seed script. The NestJS application configures its own connection in
 * `app.module.ts`; this file mirrors that configuration for tooling that runs
 * outside the Nest dependency-injection context.
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(
    process.env.DATABASE_PORT ||
      process.env.POSTGRES_PORT ||
      (process.env.POSTGRES_HOST ? '5432' : '5435'),
    10,
  ),
  username:
    process.env.DATABASE_USER || process.env.POSTGRES_USER || 'rampup_user',
  password:
    process.env.DATABASE_PASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    'rampup_password',
  database:
    process.env.DATABASE_NAME || process.env.POSTGRES_DATABASE || 'rampup_db',
  ssl:
    process.env.DATABASE_SSL === 'true' || !!process.env.POSTGRES_HOST
      ? { rejectUnauthorized: false }
      : false,
  entities: [join(__dirname, 'entities', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '!(*.spec).{ts,js}')],
  synchronize: false,
  logging: ['error', 'migration'],
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;

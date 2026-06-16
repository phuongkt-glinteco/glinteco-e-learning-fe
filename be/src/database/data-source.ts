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
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5435', 10),
  username: process.env.DATABASE_USER || 'rampup_user',
  password: process.env.DATABASE_PASSWORD || 'rampup_password',
  database: process.env.DATABASE_NAME || 'rampup_db',
  entities: [join(__dirname, 'entities', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: ['error', 'migration'],
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;

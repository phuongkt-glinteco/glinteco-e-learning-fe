import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLeaderboardIndexes1784301321000 implements MigrationInterface {
  name = 'AddLeaderboardIndexes1784301321000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_users_leaderboard_global" ON "users" ("level" DESC, "xp" DESC, "streakDays" DESC, "createdAt" ASC, "id" ASC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_leaderboard_cohort" ON "users" ("cohortId", "level" DESC, "xp" DESC, "streakDays" DESC, "createdAt" ASC, "id" ASC)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_leaderboard_cohort"`);
    await queryRunner.query(`DROP INDEX "IDX_users_leaderboard_global"`);
  }
}

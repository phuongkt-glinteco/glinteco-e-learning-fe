import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationSettingsToUsers1781360000000 implements MigrationInterface {
  name = 'AddNotificationSettingsToUsers1781360000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "notify_exercise_reviewed" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "notify_exercise_changes_requested" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "notify_cohort_assigned" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "notify_new_lesson_published" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "notify_new_lesson_published"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "notify_cohort_assigned"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "notify_exercise_changes_requested"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "notify_exercise_reviewed"`,
    );
  }
}

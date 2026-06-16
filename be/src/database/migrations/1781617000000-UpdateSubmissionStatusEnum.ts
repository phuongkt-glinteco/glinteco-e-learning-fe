import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSubmissionStatusEnum1781617000000 implements MigrationInterface {
  name = 'UpdateSubmissionStatusEnum1781617000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new values to the submissions_status_enum
    await queryRunner.query(
      `ALTER TYPE "public"."submissions_status_enum" ADD VALUE IF NOT EXISTS 'submitted'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."submissions_status_enum" ADD VALUE IF NOT EXISTS 'changes'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // To revert, we rename the current enum, create the old one, cast column values, and drop the old enum.
    // Note: if there are rows with 'submitted' or 'changes' in status, this rollback will fail unless we handle them.
    // We update those rows back to 'pending' to make it safe.
    await queryRunner.query(
      `UPDATE "submissions" SET "status" = 'pending' WHERE "status"::text IN ('submitted', 'changes')`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."submissions_status_enum" RENAME TO "submissions_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."submissions_status_enum" AS ENUM('pending', 'reviewed', 'approved', 'rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" ALTER COLUMN "status" TYPE "public"."submissions_status_enum" USING "status"::text::"public"."submissions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(`DROP TYPE "submissions_status_enum_old"`);
  }
}

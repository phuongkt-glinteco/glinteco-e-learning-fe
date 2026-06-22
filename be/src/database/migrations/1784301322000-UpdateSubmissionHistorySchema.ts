import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSubmissionHistorySchema1784301322000 implements MigrationInterface {
  name = 'UpdateSubmissionHistorySchema1784301322000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Make adminId column nullable in submission_histories
    await queryRunner.query(
      `ALTER TABLE "submission_histories" ALTER COLUMN "adminId" DROP NOT NULL`,
    );

    // 2. Add pr_url column to submission_histories
    await queryRunner.query(
      `ALTER TABLE "submission_histories" ADD "pr_url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Remove pr_url column
    await queryRunner.query(
      `ALTER TABLE "submission_histories" DROP COLUMN "pr_url"`,
    );

    // 2. Make adminId column NOT NULL again (Warning: if there are null values, this will fail. But it is correct down migration behavior).
    await queryRunner.query(
      `ALTER TABLE "submission_histories" ALTER COLUMN "adminId" SET NOT NULL`,
    );
  }
}

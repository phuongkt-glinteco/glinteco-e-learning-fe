import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLastClaimedXpAtToUsers1784301323000 implements MigrationInterface {
  name = 'AddLastClaimedXpAtToUsers1784301323000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "last_claimed_xp_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "last_claimed_xp_at"`,
    );
  }
}

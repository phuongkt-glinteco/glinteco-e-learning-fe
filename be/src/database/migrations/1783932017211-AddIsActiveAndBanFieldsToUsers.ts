import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveAndBanFieldsToUsers1783932017211 implements MigrationInterface {
  name = 'AddIsActiveAndBanFieldsToUsers1783932017211';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "ban_reason" character varying`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "banned_until" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "banned_until"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "ban_reason"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isActive"`);
  }
}

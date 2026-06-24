import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToCohorts1781624224625 implements MigrationInterface {
  name = 'AddIsActiveToCohorts1781624224625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cohorts" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cohorts" DROP COLUMN "isActive"`);
  }
}

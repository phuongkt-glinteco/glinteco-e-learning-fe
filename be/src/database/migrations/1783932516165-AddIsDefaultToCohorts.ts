import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsDefaultToCohorts1783932516165 implements MigrationInterface {
  name = 'AddIsDefaultToCohorts1783932516165';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cohorts" ADD "is_default" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cohorts" DROP COLUMN "is_default"`);
  }
}

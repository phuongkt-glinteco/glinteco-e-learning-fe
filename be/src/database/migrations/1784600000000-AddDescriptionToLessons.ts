import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescriptionToLessons1784600000000 implements MigrationInterface {
  name = 'AddDescriptionToLessons1784600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "description" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "description"`);
  }
}

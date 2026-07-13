import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * GLI-94: Track.status (Developing|Active|Archived) + Tag.category
 * GLI-90: Exercise.is_mandatory
 * GLI-92: Exercise.type (PR_REVIEW|QUIZ|FILL_IN_BLANK) + questions_data + target_score
 */
export class AddProgressEngineAndAdminTrackFields1784700000000 implements MigrationInterface {
  name = 'AddProgressEngineAndAdminTrackFields1784700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "tracks_status_enum" AS ENUM('Developing', 'Active', 'Archived')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tracks" ADD "status" "tracks_status_enum" NOT NULL DEFAULT 'Active'`,
    );

    await queryRunner.query(
      `CREATE TYPE "tags_category_enum" AS ENUM('TRACK', 'EXERCISE', 'DOCUMENT', 'GENERAL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tags" ADD "category" "tags_category_enum" NOT NULL DEFAULT 'GENERAL'`,
    );

    await queryRunner.query(
      `CREATE TYPE "exercises_type_enum" AS ENUM('PR_REVIEW', 'QUIZ', 'FILL_IN_BLANK')`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD "type" "exercises_type_enum" NOT NULL DEFAULT 'PR_REVIEW'`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD "questions_data" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD "target_score" integer NOT NULL DEFAULT 100`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD "is_mandatory" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exercises" DROP COLUMN "is_mandatory"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" DROP COLUMN "target_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" DROP COLUMN "questions_data"`,
    );
    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "exercises_type_enum"`);
    await queryRunner.query(`ALTER TABLE "tags" DROP COLUMN "category"`);
    await queryRunner.query(`DROP TYPE "tags_category_enum"`);
    await queryRunner.query(`ALTER TABLE "tracks" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "tracks_status_enum"`);
  }
}

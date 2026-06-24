import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExerciseDetails1781622361007 implements MigrationInterface {
  name = 'AddExerciseDetails1781622361007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create enum type for exercise difficulty
    await queryRunner.query(
      `CREATE TYPE "public"."exercises_difficulty_enum" AS ENUM('Beginner', 'Intermediate', 'Advanced')`,
    );

    // 2. Add columns to exercises table
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD "tag" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD "difficulty" "public"."exercises_difficulty_enum" NOT NULL DEFAULT 'Intermediate'`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD "estimated_time" character varying NOT NULL DEFAULT '1h'`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD "xp" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD "brief" text NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD "overview" text NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(`ALTER TABLE "exercises" ADD "hint" text`);

    // Remove defaults so they aren't persisted for future inserts
    await queryRunner.query(
      `ALTER TABLE "exercises" ALTER COLUMN "tag" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ALTER COLUMN "difficulty" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ALTER COLUMN "estimated_time" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ALTER COLUMN "xp" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ALTER COLUMN "brief" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ALTER COLUMN "overview" DROP DEFAULT`,
    );

    // 3. Create exercise_documents junction table
    await queryRunner.query(
      `CREATE TABLE "exercise_documents" ("exerciseId" uuid NOT NULL, "documentId" uuid NOT NULL, CONSTRAINT "PK_exercise_documents" PRIMARY KEY ("exerciseId", "documentId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_exercise_documents_exerciseId" ON "exercise_documents" ("exerciseId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_exercise_documents_documentId" ON "exercise_documents" ("documentId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercise_documents" ADD CONSTRAINT "FK_exercise_documents_exerciseId" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercise_documents" ADD CONSTRAINT "FK_exercise_documents_documentId" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exercise_documents" DROP CONSTRAINT "FK_exercise_documents_documentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercise_documents" DROP CONSTRAINT "FK_exercise_documents_exerciseId"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_exercise_documents_documentId"`);
    await queryRunner.query(`DROP INDEX "IDX_exercise_documents_exerciseId"`);
    await queryRunner.query(`DROP TABLE "exercise_documents"`);

    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN "hint"`);
    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN "overview"`);
    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN "brief"`);
    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN "xp"`);
    await queryRunner.query(
      `ALTER TABLE "exercises" DROP COLUMN "estimated_time"`,
    );
    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN "difficulty"`);
    await queryRunner.query(`DROP TYPE "public"."exercises_difficulty_enum"`);
    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN "tag"`);
  }
}

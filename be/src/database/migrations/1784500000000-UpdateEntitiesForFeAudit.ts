import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEntitiesForFeAudit1784500000000 implements MigrationInterface {
  name = 'UpdateEntitiesForFeAudit1784500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add level and thumbnail columns to tracks table
    await queryRunner.query(
      `ALTER TABLE "tracks" ADD "level" character varying NOT NULL DEFAULT 'Beginner'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tracks" ADD "thumbnail" character varying`,
    );

    // 2. Add type enum and column to lessons table
    await queryRunner.query(
      `CREATE TYPE "lessons_type_enum" AS ENUM('video', 'reading', 'quiz', 'coding', 'assignment')`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD "type" "lessons_type_enum" NOT NULL DEFAULT 'reading'`,
    );

    // 3. Add lessonId column and foreign key constraint to exercises table
    await queryRunner.query(`ALTER TABLE "exercises" ADD "lessonId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD CONSTRAINT "FK_exercises_lessonId" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL`,
    );

    // 4. Create lesson_documents join table
    await queryRunner.query(
      `CREATE TABLE "lesson_documents" ("lessonId" uuid NOT NULL, "documentId" uuid NOT NULL, CONSTRAINT "PK_lesson_documents" PRIMARY KEY ("lessonId", "documentId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_lesson_documents_lessonId" ON "lesson_documents" ("lessonId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_lesson_documents_documentId" ON "lesson_documents" ("documentId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_documents" ADD CONSTRAINT "FK_lesson_documents_lessonId" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_documents" ADD CONSTRAINT "FK_lesson_documents_documentId" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Revert lesson_documents join table
    await queryRunner.query(
      `ALTER TABLE "lesson_documents" DROP CONSTRAINT "FK_lesson_documents_documentId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lesson_documents" DROP CONSTRAINT "FK_lesson_documents_lessonId"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_lesson_documents_documentId"`);
    await queryRunner.query(`DROP INDEX "IDX_lesson_documents_lessonId"`);
    await queryRunner.query(`DROP TABLE "lesson_documents"`);

    // 2. Revert exercises changes
    await queryRunner.query(
      `ALTER TABLE "exercises" DROP CONSTRAINT "FK_exercises_lessonId"`,
    );
    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN "lessonId"`);

    // 3. Revert lessons changes
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "lessons_type_enum"`);

    // 4. Revert tracks changes
    await queryRunner.query(`ALTER TABLE "tracks" DROP COLUMN "thumbnail"`);
    await queryRunner.query(`ALTER TABLE "tracks" DROP COLUMN "level"`);
  }
}

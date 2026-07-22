import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExerciseContentAndAutoGradeTable1784800000000
  implements MigrationInterface
{
  name = 'AddExerciseContentAndAutoGradeTable1784800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create auto_grades table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "auto_grades" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "exerciseId" uuid NOT NULL,
        "result" jsonb NOT NULL,
        "passed" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_auto_grades" PRIMARY KEY ("id"),
        CONSTRAINT "FK_auto_grades_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_auto_grades_exerciseId" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE
      )
    `);

    // 2. Add in_progress to submissions_status_enum
    await queryRunner.query(
      `ALTER TYPE "public"."submissions_status_enum" ADD VALUE IF NOT EXISTS 'in_progress'`,
    );

    // 3. Make prUrl nullable in submissions table
    await queryRunner.query(
      `ALTER TABLE "submissions" ALTER COLUMN "prUrl" DROP NOT NULL`,
    ).catch(() =>
      queryRunner.query(`ALTER TABLE "submissions" ALTER COLUMN "pr_url" DROP NOT NULL`).catch(() => {})
    );

    // 4. Add tag_id and content to exercises table
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "tag_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD COLUMN IF NOT EXISTS "content" jsonb NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "exercises" ADD CONSTRAINT "FK_exercises_tag_id" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE SET NULL`,
    ).catch(() => {});

    // 5. Migrate data: populate content from legacy columns where content is empty
    await queryRunner.query(`
      UPDATE "exercises"
      SET "content" = jsonb_build_object(
        'overview', COALESCE("overview", ''),
        'objectives', COALESCE("objectives", '[]'::jsonb),
        'steps', COALESCE("steps", '[]'::jsonb),
        'questions', COALESCE("questions_data", '[]'::jsonb),
        'targetScore', COALESCE("target_score", 100)
      )
      WHERE "content" = '{}'::jsonb OR "content" IS NULL
    `).catch(() => {});

    // 6. Migrate tag strings to tags table and link tag_id
    await queryRunner.query(`
      INSERT INTO "tags" ("id", "name", "category", "createdAt", "updatedAt")
      SELECT uuid_generate_v4(), e."tag", 'EXERCISE', now(), now()
      FROM "exercises" e
      LEFT JOIN "tags" t ON t."name" = e."tag"
      WHERE e."tag" IS NOT NULL AND e."tag" != '' AND t."id" IS NULL
      GROUP BY e."tag"
    `).catch(() => {});

    await queryRunner.query(`
      UPDATE "exercises" e
      SET "tag_id" = t."id"
      FROM "tags" t
      WHERE e."tag" = t."name" AND e."tag_id" IS NULL
    `).catch(() => {});
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exercises" DROP CONSTRAINT IF EXISTS "FK_exercises_tag_id"`,
    );
    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN IF EXISTS "content"`);
    await queryRunner.query(`ALTER TABLE "exercises" DROP COLUMN IF EXISTS "tag_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auto_grades"`);
  }
}

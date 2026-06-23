import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTracksAndLessonsSchema1784400000000 implements MigrationInterface {
  name = 'UpdateTracksAndLessonsSchema1784400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop index on name column
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_tracks_name_search"`);

    // 2. Alter tracks table: rename name to title, add description, estimatedTime, icon columns
    await queryRunner.query(`ALTER TABLE "tracks" RENAME COLUMN "name" TO "title"`);
    await queryRunner.query(`ALTER TABLE "tracks" ADD "description" text NOT NULL DEFAULT ''`);
    await queryRunner.query(`ALTER TABLE "tracks" ADD "estimatedTime" character varying NOT NULL DEFAULT '1h'`);
    await queryRunner.query(`ALTER TABLE "tracks" ADD "icon" character varying NOT NULL DEFAULT 'flag'`);

    // 3. Re-create index on title column
    await queryRunner.query(
      `CREATE INDEX "IDX_tracks_title_search" ON "tracks" USING gin(to_tsvector('simple', "title"))`,
    );

    // 4. Alter lessons table: rename name to title, add estimatedTime, rename content to body
    await queryRunner.query(`ALTER TABLE "lessons" RENAME COLUMN "name" TO "title"`);
    await queryRunner.query(`ALTER TABLE "lessons" ADD "estimatedTime" character varying NOT NULL DEFAULT '30m'`);
    await queryRunner.query(`ALTER TABLE "lessons" RENAME COLUMN "content" TO "body"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Revert lessons changes
    await queryRunner.query(`ALTER TABLE "lessons" RENAME COLUMN "body" TO "content"`);
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "estimatedTime"`);
    await queryRunner.query(`ALTER TABLE "lessons" RENAME COLUMN "title" TO "name"`);

    // 2. Drop index on title column
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_tracks_title_search"`);

    // 3. Revert tracks changes
    await queryRunner.query(`ALTER TABLE "tracks" DROP COLUMN "icon"`);
    await queryRunner.query(`ALTER TABLE "tracks" DROP COLUMN "estimatedTime"`);
    await queryRunner.query(`ALTER TABLE "tracks" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "tracks" RENAME COLUMN "title" TO "name"`);

    // 4. Re-create index on name column
    await queryRunner.query(
      `CREATE INDEX "IDX_tracks_name_search" ON "tracks" USING gin(to_tsvector('simple', "name"))`,
    );
  }
}

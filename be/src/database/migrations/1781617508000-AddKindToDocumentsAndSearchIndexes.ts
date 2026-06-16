import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKindToDocumentsAndSearchIndexes1781617508000 implements MigrationInterface {
  name = 'AddKindToDocumentsAndSearchIndexes1781617508000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create enum type and add kind column
    await queryRunner.query(
      `CREATE TYPE "public"."documents_kind_enum" AS ENUM('Guide', 'Reference', 'Runbook', 'Tutorial', 'Link')`,
    );
    await queryRunner.query(
      `ALTER TABLE "documents" ADD "kind" "public"."documents_kind_enum" NOT NULL DEFAULT 'Guide'`,
    );

    // 2. Create search indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_tracks_name_search" ON "tracks" USING gin(to_tsvector('simple', "name"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_documents_content_search" ON "documents" USING gin(to_tsvector('simple', "title" || ' ' || coalesce("content", '')))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_exercises_title_search" ON "exercises" USING gin(to_tsvector('simple', "title"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "public"."IDX_exercises_title_search"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_documents_content_search"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tracks_name_search"`);

    // Drop kind column and enum type
    await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "kind"`);
    await queryRunner.query(`DROP TYPE "public"."documents_kind_enum"`);
  }
}

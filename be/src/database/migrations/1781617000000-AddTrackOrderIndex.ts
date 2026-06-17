import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrackOrderIndex1781617000000 implements MigrationInterface {
  name = 'AddTrackOrderIndex1781617000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_tracks_track_order" ON "tracks" ("track_order")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_tracks_track_order"`);
  }
}

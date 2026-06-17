import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLessonsCompletedToTrackProgress1781628751000
  implements MigrationInterface
{
  name = 'AddLessonsCompletedToTrackProgress1781628751000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "track_progresses" ADD "lessonsCompleted" integer NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "track_progresses" DROP COLUMN "lessonsCompleted"`,
    );
  }
}

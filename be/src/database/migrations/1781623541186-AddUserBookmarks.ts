import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserBookmarks1781623541186 implements MigrationInterface {
  name = 'AddUserBookmarks1781623541186';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_bookmarks" ("userId" uuid NOT NULL, "documentId" uuid NOT NULL, CONSTRAINT "PK_4ac1030805e93ff8d04850bd303" PRIMARY KEY ("userId", "documentId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4b389508f2d566939ed163a00d" ON "user_bookmarks"  ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d921c731c12b8a7b6483fc019b" ON "user_bookmarks"  ("documentId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bookmarks" ADD CONSTRAINT "FK_4b389508f2d566939ed163a00d6" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bookmarks" ADD CONSTRAINT "FK_d921c731c12b8a7b6483fc019b9" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_bookmarks" DROP CONSTRAINT "FK_d921c731c12b8a7b6483fc019b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_bookmarks" DROP CONSTRAINT "FK_4b389508f2d566939ed163a00d6"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d921c731c12b8a7b6483fc019b"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4b389508f2d566939ed163a00d"`,
    );
    await queryRunner.query(`DROP TABLE "user_bookmarks"`);
  }
}

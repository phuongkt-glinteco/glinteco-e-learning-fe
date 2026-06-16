import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserAndLessonProgress1781615351400 implements MigrationInterface {
    name = 'UpdateUserAndLessonProgress1781615351400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "lesson_progresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "lessonId" uuid NOT NULL, "completedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3a24c9bf09b4e128257ce311f40" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "title" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "avatarHue" integer`);
        await queryRunner.query(`ALTER TABLE "lesson_progresses" ADD CONSTRAINT "FK_a234c2d69fdfb75f9dbb0c0df85" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lesson_progresses" ADD CONSTRAINT "FK_1ae6dc648aeb32e142200d47c01" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "lesson_progresses" DROP CONSTRAINT "FK_1ae6dc648aeb32e142200d47c01"`);
        await queryRunner.query(`ALTER TABLE "lesson_progresses" DROP CONSTRAINT "FK_a234c2d69fdfb75f9dbb0c0df85"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarHue"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "title"`);
        await queryRunner.query(`DROP TABLE "lesson_progresses"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1781611485949 implements MigrationInterface {
    name = 'InitialSchema1781611485949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "lessons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trackId" uuid NOT NULL, "name" character varying NOT NULL, "lesson_order" integer NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "submission_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "submissionId" uuid NOT NULL, "adminId" uuid NOT NULL, "action" character varying NOT NULL, "comment" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fec3566ea59048f1db95339df65" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."submissions_status_enum" AS ENUM('pending', 'reviewed', 'approved', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "submissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "exerciseId" uuid NOT NULL, "prUrl" character varying NOT NULL, "status" "public"."submissions_status_enum" NOT NULL DEFAULT 'pending', "submittedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_10b3be95b8b2fb1e482e07d706b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "exercises" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trackId" uuid NOT NULL, "title" character varying NOT NULL, "objectives" jsonb, "steps" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c4c46f5fa89a58ba7c2d894e3c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tracks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "track_order" integer NOT NULL, "lessonsCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_242a37ffc7870380f0e611986e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."track_progresses_status_enum" AS ENUM('not_started', 'in_progress', 'completed')`);
        await queryRunner.query(`CREATE TABLE "track_progresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "trackId" uuid NOT NULL, "status" "public"."track_progresses_status_enum" NOT NULL DEFAULT 'not_started', "startedAt" TIMESTAMP, "completedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_683f72ce2917921e2507b30f3d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('learner', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'learner', "level" integer NOT NULL DEFAULT '1', "xp" integer NOT NULL DEFAULT '0', "streakDays" integer NOT NULL DEFAULT '0', "cohortId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cohorts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "targetRampDays" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fd38f76b135e907b834fda1e752" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "content" text, "url" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ac51aa5181ee2036f5ca482857c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "document_tags" ("documentId" uuid NOT NULL, "tagId" uuid NOT NULL, CONSTRAINT "PK_5b662ef9a9b76508d84aa6b1e44" PRIMARY KEY ("documentId", "tagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1f87f7b4ec76661b26ce44dd78" ON "document_tags"  ("documentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_abea3d41e67e47e125726fde4b" ON "document_tags"  ("tagId") `);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_02843b8060a08b8fff9f9af2ebf" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "submission_histories" ADD CONSTRAINT "FK_37932cb37bd6e5dd3c4f0166816" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "submission_histories" ADD CONSTRAINT "FK_2f3b09f246317c9218a52c58028" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "submissions" ADD CONSTRAINT "FK_eae888413ab8fc63cc48759d46a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "submissions" ADD CONSTRAINT "FK_2049da14f4b00d8615636978c93" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exercises" ADD CONSTRAINT "FK_da5e3c9904cb5d0c4026634f341" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "track_progresses" ADD CONSTRAINT "FK_60de07c37674ab74705db98b861" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "track_progresses" ADD CONSTRAINT "FK_0604fa373b12cf15cce2cc17d34" FOREIGN KEY ("trackId") REFERENCES "tracks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_eceba7bf357a35252a7f46ccc40" FOREIGN KEY ("cohortId") REFERENCES "cohorts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_tags" ADD CONSTRAINT "FK_1f87f7b4ec76661b26ce44dd783" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "document_tags" ADD CONSTRAINT "FK_abea3d41e67e47e125726fde4b1" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_tags" DROP CONSTRAINT "FK_abea3d41e67e47e125726fde4b1"`);
        await queryRunner.query(`ALTER TABLE "document_tags" DROP CONSTRAINT "FK_1f87f7b4ec76661b26ce44dd783"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_eceba7bf357a35252a7f46ccc40"`);
        await queryRunner.query(`ALTER TABLE "track_progresses" DROP CONSTRAINT "FK_0604fa373b12cf15cce2cc17d34"`);
        await queryRunner.query(`ALTER TABLE "track_progresses" DROP CONSTRAINT "FK_60de07c37674ab74705db98b861"`);
        await queryRunner.query(`ALTER TABLE "exercises" DROP CONSTRAINT "FK_da5e3c9904cb5d0c4026634f341"`);
        await queryRunner.query(`ALTER TABLE "submissions" DROP CONSTRAINT "FK_2049da14f4b00d8615636978c93"`);
        await queryRunner.query(`ALTER TABLE "submissions" DROP CONSTRAINT "FK_eae888413ab8fc63cc48759d46a"`);
        await queryRunner.query(`ALTER TABLE "submission_histories" DROP CONSTRAINT "FK_2f3b09f246317c9218a52c58028"`);
        await queryRunner.query(`ALTER TABLE "submission_histories" DROP CONSTRAINT "FK_37932cb37bd6e5dd3c4f0166816"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_02843b8060a08b8fff9f9af2ebf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_abea3d41e67e47e125726fde4b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1f87f7b4ec76661b26ce44dd78"`);
        await queryRunner.query(`DROP TABLE "document_tags"`);
        await queryRunner.query(`DROP TABLE "documents"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "cohorts"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "track_progresses"`);
        await queryRunner.query(`DROP TYPE "public"."track_progresses_status_enum"`);
        await queryRunner.query(`DROP TABLE "tracks"`);
        await queryRunner.query(`DROP TABLE "exercises"`);
        await queryRunner.query(`DROP TABLE "submissions"`);
        await queryRunner.query(`DROP TYPE "public"."submissions_status_enum"`);
        await queryRunner.query(`DROP TABLE "submission_histories"`);
        await queryRunner.query(`DROP TABLE "lessons"`);
    }

}

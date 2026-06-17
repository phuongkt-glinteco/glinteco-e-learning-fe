import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cohort } from '../database/entities/cohort.entity';
import { User } from '../database/entities/user.entity';
import { Track } from '../database/entities/track.entity';
import { TrackProgress } from '../database/entities/track-progress.entity';
import { Submission } from '../database/entities/submission.entity';
import { Lesson } from '../database/entities/lesson.entity';
import { LessonProgress } from '../database/entities/lesson-progress.entity';
import { CohortController } from './cohort.controller';
import { CohortService } from './cohort.service';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cohort,
      User,
      Track,
      TrackProgress,
      Submission,
      Lesson,
      LessonProgress,
    ]),
    AuthModule,
  ],
  controllers: [CohortController],
  providers: [CohortService],
  exports: [CohortService],
})
export class CohortModule {}

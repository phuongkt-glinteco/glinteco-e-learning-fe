import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from '../database/entities/exercise.entity';
import { Track } from '../database/entities/track.entity';
import { Document } from '../database/entities/document.entity';
import { Submission } from '../database/entities/submission.entity';
import { Lesson } from '../database/entities/lesson.entity';
import { LessonProgress } from '../database/entities/lesson-progress.entity';
import { AutoGrade } from '../database/entities/auto-grade.entity';
import { Tag } from '../database/entities/tag.entity';
import { User } from '../database/entities/user.entity';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Exercise,
      Track,
      Document,
      Submission,
      Lesson,
      LessonProgress,
      AutoGrade,
      Tag,
      User,
    ]),
    AuthModule,
  ],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}

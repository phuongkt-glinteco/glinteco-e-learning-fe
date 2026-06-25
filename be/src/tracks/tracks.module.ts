import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from '../database/entities/track.entity';
import { TrackProgress } from '../database/entities/track-progress.entity';
import { Lesson } from '../database/entities/lesson.entity';
import { LessonProgress } from '../database/entities/lesson-progress.entity';
import { User } from '../database/entities/user.entity';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { LessonsController } from './lessons.controller';
import { AuthModule } from '../modules/auth/auth.module';
import { ExercisesModule } from '../exercises/exercises.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Track,
      TrackProgress,
      Lesson,
      LessonProgress,
      User,
    ]),
    AuthModule,
    ExercisesModule,
  ],
  controllers: [TracksController, LessonsController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {}

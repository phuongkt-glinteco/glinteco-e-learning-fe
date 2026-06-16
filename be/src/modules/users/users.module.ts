import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../database/entities/user.entity';
import { Lesson } from '../../database/entities/lesson.entity';
import { LessonProgress } from '../../database/entities/lesson-progress.entity';
import { Track } from '../../database/entities/track.entity';
import { TrackProgress } from '../../database/entities/track-progress.entity';
import { Submission } from '../../database/entities/submission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Lesson,
      LessonProgress,
      Track,
      TrackProgress,
      Submission,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

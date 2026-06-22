import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {
  User,
  Cohort,
  Track,
  Lesson,
  TrackProgress,
  Exercise,
  Submission,
  SubmissionHistory,
  Document,
  Tag,
  LessonProgress,
} from '../../database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Cohort,
      Track,
      Lesson,
      TrackProgress,
      Exercise,
      Submission,
      SubmissionHistory,
      Document,
      Tag,
      LessonProgress,
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

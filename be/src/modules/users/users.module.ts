import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AdminUsersController } from './admin-users.controller';
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
  RefreshToken,
  Notification,
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
      RefreshToken,
      Notification,
    ]),
  ],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

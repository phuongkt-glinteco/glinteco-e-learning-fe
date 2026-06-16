import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../../database/entities/user.entity';
import { Lesson } from '../../database/entities/lesson.entity';
import { Submission } from '../../database/entities/submission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Lesson, Submission])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

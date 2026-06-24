import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from '../database/entities/exercise.entity';
import { Track } from '../database/entities/track.entity';
import { Document } from '../database/entities/document.entity';
import { Submission } from '../database/entities/submission.entity';
import { ExercisesService } from './exercises.service';
import { ExercisesController } from './exercises.controller';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exercise, Track, Document, Submission]),
    AuthModule,
  ],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from '../database/entities/track.entity';
import { Document } from '../database/entities/document.entity';
import { Exercise } from '../database/entities/exercise.entity';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Track, Document, Exercise]), AuthModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from '../database/entities/document.entity';
import { Tag } from '../database/entities/tag.entity';
import { User } from '../database/entities/user.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { AuthModule } from '../modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document, Tag, User]), AuthModule],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}

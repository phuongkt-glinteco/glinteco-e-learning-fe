import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Track } from '../database/entities/track.entity';
import { TracksController } from './tracks.controller';
import { TracksRepository } from './tracks.repository';
import { TracksService } from './tracks.service';

@Module({
  // AuthModule provides JwtAuthGuard + RolesGuard (and the JwtModule they need);
  // TypeOrmModule.forFeature registers the Track repository metadata.
  imports: [TypeOrmModule.forFeature([Track]), AuthModule],
  controllers: [TracksController],
  providers: [TracksService, TracksRepository],
  exports: [TracksService, TracksRepository],
})
export class TracksModule {}

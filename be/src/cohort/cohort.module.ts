import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cohort } from '../database/entities/cohort.entity';
import { User } from '../database/entities/user.entity';
import { CohortController } from './cohort.controller';
import { CohortService } from './cohort.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cohort, User]),
    AuthModule,
  ],
  controllers: [CohortController],
  providers: [CohortService],
  exports: [CohortService],
})
export class CohortModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  HeaderResolver,
  I18nModule,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import * as path from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CohortModule } from './cohort/cohort.module';
import { TracksModule } from './tracks/tracks.module';
import { DocumentsModule } from './documents/documents.module';
import { SearchModule } from './search/search.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { SubmissionsModule } from './submissions/submissions.module';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host:
          configService.get<string>('POSTGRES_HOST') ||
          configService.get<string>('DATABASE_HOST', 'localhost'),
        port: Number(
          configService.get<string>('POSTGRES_PORT') ||
            configService.get<string>('DATABASE_PORT') ||
            (configService.get<string>('POSTGRES_HOST') ? '5432' : '5435'),
        ),
        username:
          configService.get<string>('POSTGRES_USER') ||
          configService.get<string>('DATABASE_USER', 'rampup_user'),
        password:
          configService.get<string>('POSTGRES_PASSWORD') ||
          configService.get<string>('DATABASE_PASSWORD', 'rampup_password'),
        database:
          configService.get<string>('POSTGRES_DATABASE') ||
          configService.get<string>('DATABASE_NAME', 'rampup_db'),
        ssl:
          configService.get<string>('DATABASE_SSL') === 'true' ||
          !!configService.get<string>('POSTGRES_HOST')
            ? { rejectUnauthorized: false }
            : false,
        entities: [
          path.join(__dirname, 'database/entities', '*.entity{.ts,.js}'),
        ],
        autoLoadEntities: true,
        // Schema is managed by migrations (src/database/migrations). Keep
        // synchronize off by default to avoid accidental schema drift.
        synchronize:
          configService.get<string>('DATABASE_SYNCHRONIZE', 'false') === 'true',
      }),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: HeaderResolver, options: ['x-custom-lang'] },
        AcceptLanguageResolver,
      ],
    }),
    AuthModule,
    CohortModule,
    TracksModule,
    DocumentsModule,
    SearchModule,
    LeaderboardModule,
    SubmissionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

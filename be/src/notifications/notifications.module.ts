import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../database/entities/notification.entity';
import { User } from '../database/entities/user.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { AuthModule } from '../modules/auth/auth.module';
import { SubmissionNotificationsListener } from './listeners/submission-notifications.listener';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, User]), AuthModule, MailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, SubmissionNotificationsListener],
  exports: [NotificationsService],
})
export class NotificationsModule {}

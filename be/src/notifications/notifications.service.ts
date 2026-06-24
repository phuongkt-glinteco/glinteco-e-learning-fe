import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../database/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(
    userId: string,
    type: string,
    title: string,
    body: string,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      userId,
      type,
      title,
      body,
      read: false,
    });
    return this.notificationRepository.save(notification);
  }

  async findAll(userId: string) {
    const notifications = await this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    const data = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      read: n.read,
      createdAt: n.createdAt,
    }));

    return {
      data,
      unreadCount,
    };
  }

  async markRead(id: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Không tìm thấy thông báo với ID: ${id}`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa đổi thông báo này.');
    }

    notification.read = true;
    await this.notificationRepository.save(notification);

    return {
      id: notification.id,
      read: true,
    };
  }
}

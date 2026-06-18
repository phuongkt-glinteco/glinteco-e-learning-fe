import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { Notification } from '../database/entities/notification.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a notification', async () => {
      const dto = {
        userId: 'user-1',
        type: 'track_unlocked',
        title: 'New track',
        body: 'Body text',
      };
      mockNotificationRepository.create.mockReturnValue({ id: 'notif-1', ...dto, read: false });
      mockNotificationRepository.save.mockImplementation((n) => Promise.resolve(n));

      const result = await service.create(dto.userId, dto.type, dto.title, dto.body);
      expect(result).toBeDefined();
      expect(result.id).toBe('notif-1');
      expect(result.read).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return notifications list and unread count', async () => {
      const date = new Date();
      mockNotificationRepository.find.mockResolvedValue([
        { id: 'n1', userId: 'user-1', type: 't1', title: 'T1', body: 'B1', read: false, createdAt: date },
        { id: 'n2', userId: 'user-1', type: 't2', title: 'T2', body: 'B2', read: true, createdAt: date },
      ]);

      const result = await service.findAll('user-1');
      expect(result.data).toHaveLength(2);
      expect(result.unreadCount).toBe(1);
      expect(result.data[0].id).toBe('n1');
    });
  });

  describe('markRead', () => {
    it('should mark notification read successfully', async () => {
      const notif = { id: 'n1', userId: 'user-1', read: false };
      mockNotificationRepository.findOne.mockResolvedValue(notif);
      mockNotificationRepository.save.mockImplementation((n) => Promise.resolve(n));

      const result = await service.markRead('n1', 'user-1');
      expect(result.read).toBe(true);
      expect(notif.read).toBe(true);
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);
      await expect(service.markRead('n1', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if userId does not match owner', async () => {
      const notif = { id: 'n1', userId: 'user-2', read: false };
      mockNotificationRepository.findOne.mockResolvedValue(notif);

      await expect(service.markRead('n1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });
});

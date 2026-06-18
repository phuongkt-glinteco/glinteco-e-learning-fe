import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { User } from '../database/entities/user.entity';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockNotificationsService = {
    findAll: jest.fn(),
    markRead: jest.fn(),
  };

  const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };

  const mockUser = {
    id: 'user-123',
  } as User;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      mockNotificationsService.findAll.mockResolvedValue({ data: [], unreadCount: 0 });

      const result = await controller.findAll(mockUser);
      expect(mockNotificationsService.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({ data: [], unreadCount: 0 });
    });
  });

  describe('markRead', () => {
    it('should call service.markRead', async () => {
      mockNotificationsService.markRead.mockResolvedValue({ id: 'n1', read: true });

      const result = await controller.markRead('n1', mockUser);
      expect(mockNotificationsService.markRead).toHaveBeenCalledWith('n1', mockUser.id);
      expect(result).toEqual({ id: 'n1', read: true });
    });
  });
});

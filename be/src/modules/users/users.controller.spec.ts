import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ForbiddenException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User, UserRole } from '../../database/entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    updateProfile: jest.fn(),
    getStats: jest.fn(),
    findAll: jest.fn(),
    findOneOrFail: jest.fn(),
    claimDailyXp: jest.fn(),
  };

  const mockLearner = {
    id: 'user-123',
    email: 'learner@company.com',
    role: UserRole.LEARNER,
  } as User;

  const mockAdmin = {
    id: 'admin-123',
    email: 'admin@company.com',
    role: UserRole.ADMIN,
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll with query', async () => {
      const query = { role: 'learner', q: 'John' };
      mockUsersService.findAll.mockResolvedValue({ data: [] });

      const result = await controller.findAll(query);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should throw ForbiddenException if user is not admin and not the owner', async () => {
      await expect(controller.findOne('other-id', mockLearner)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow access if user is the owner', async () => {
      const mockUser = { id: 'user-123', email: 'learner@company.com' } as User;
      mockUsersService.findOneOrFail.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-123', mockLearner);
      expect(mockUsersService.findOneOrFail).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockUser);
    });

    it('should allow access if user is an admin', async () => {
      const mockUser = { id: 'user-123', email: 'learner@company.com' } as User;
      mockUsersService.findOneOrFail.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-123', mockAdmin);
      expect(mockUsersService.findOneOrFail).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should call service.updateProfile with userId and dto', async () => {
      const dto: UpdateProfileDto = {
        name: 'Mina',
        title: 'Developer',
        avatarHue: 120,
      };
      const mockResult = { id: 'user-123', ...dto };
      mockUsersService.updateProfile.mockResolvedValue(mockResult);

      const result = await controller.updateProfile(mockLearner, dto);
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith(
        'user-123',
        dto,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getStats', () => {
    it('should call service.getStats with userId', async () => {
      const mockResult = { level: 1, xp: 100 };
      mockUsersService.getStats.mockResolvedValue(mockResult);

      const result = await controller.getStats(mockLearner);
      expect(mockUsersService.getStats).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('claimDailyXp', () => {
    it('should call service.claimDailyXp with userId', async () => {
      const mockResult = { success: true, xpAwarded: 50, streakDays: 1 };
      mockUsersService.claimDailyXp.mockResolvedValue(mockResult);

      const result = await controller.claimDailyXp(mockLearner);
      expect(mockUsersService.claimDailyXp).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockResult);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController, MockAuthGuard } from './users.controller';
import { UsersService } from './users.service';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';

interface RequestWithUser {
  user?: {
    id: string;
  };
}

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    updateProfile: jest.fn(),
    getStats: jest.fn(),
  };

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

  describe('updateProfile', () => {
    it('should throw UnauthorizedException if req.user is missing', async () => {
      const req: RequestWithUser = {};
      const dto: UpdateProfileDto = { name: 'Mina' };
      await expect(controller.updateProfile(req, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if req.user.id is missing', async () => {
      const req: RequestWithUser = { user: undefined };
      const dto: UpdateProfileDto = { name: 'Mina' };
      await expect(controller.updateProfile(req, dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should call service.updateProfile with userId and dto', async () => {
      const req: RequestWithUser = { user: { id: 'u_123' } };
      const dto: UpdateProfileDto = {
        name: 'Mina',
        title: 'Developer',
        avatarHue: 120,
      };
      const mockResult = { id: 'u_123', ...dto };
      mockUsersService.updateProfile.mockResolvedValue(mockResult);

      const result = await controller.updateProfile(req, dto);
      expect(mockUsersService.updateProfile).toHaveBeenCalledWith('u_123', dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getStats', () => {
    it('should throw UnauthorizedException if req.user is missing', async () => {
      const req: RequestWithUser = {};
      await expect(controller.getStats(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if req.user.id is missing', async () => {
      const req: RequestWithUser = { user: undefined };
      await expect(controller.getStats(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should call service.getStats with userId', async () => {
      const req: RequestWithUser = { user: { id: 'u_123' } };
      const mockResult = { level: 1, xp: 100 };
      mockUsersService.getStats.mockResolvedValue(mockResult);

      const result = await controller.getStats(req);
      expect(mockUsersService.getStats).toHaveBeenCalledWith('u_123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('MockAuthGuard', () => {
    let guard: MockAuthGuard;

    beforeEach(() => {
      guard = new MockAuthGuard();
    });

    it('should set request.user and return true', () => {
      const mockRequest: RequestWithUser = {};
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
      expect(mockRequest.user).toEqual({
        id: 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2',
      });
    });
  });
});

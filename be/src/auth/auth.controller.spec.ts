import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserRole } from '../database/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    loginWithGoogle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleLogin', () => {
    it('should call authService.loginWithGoogle and return the result', async () => {
      const dto: GoogleLoginDto = {
        idToken: 'test-id-token',
      };

      const expectedResponse: AuthResponseDto = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'mock-user-id',
          email: 'user@company.com',
          name: 'Test Name',
          role: UserRole.LEARNER,
          level: 1,
          xp: 0,
          streakDays: 0,
        },
      };

      mockAuthService.loginWithGoogle.mockResolvedValue(expectedResponse);

      const result = await controller.googleLogin(dto);

      expect(mockAuthService.loginWithGoogle).toHaveBeenCalledWith(
        'test-id-token',
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});

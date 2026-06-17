import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserRole } from '../../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<
    Pick<
      AuthService,
      'register' | 'login' | 'refresh' | 'logout' | 'loginWithGoogle' | 'forgotPassword' | 'resetPassword'
    >
  >;

  const mockUser = {
    id: 'user-id-123',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.LEARNER,
    level: 1,
    xp: 100,
    streakDays: 5,
    cohortId: 'cohort-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockTokens = {
    accessToken: 'access-token-xyz',
    refreshToken: 'refresh-token-abc',
    expiresIn: 900,
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      loginWithGoogle: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: 'securePassword123',
        name: 'Test User',
      };
      authService.register.mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        level: mockUser.level,
        xp: mockUser.xp,
        streakDays: mockUser.streakDays,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        level: mockUser.level,
        xp: mockUser.xp,
        streakDays: mockUser.streakDays,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
  });

  describe('login', () => {
    it('should login and return auth tokens', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: 'securePassword123',
      };
      authService.login.mockResolvedValue(mockTokens);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('refresh', () => {
    it('should refresh the tokens using refresh token', async () => {
      const dto: RefreshTokenDto = {
        refreshToken: 'refresh-token-abc',
      };
      authService.refresh.mockResolvedValue(mockTokens);

      const result = await controller.refresh(dto);

      expect(authService.refresh).toHaveBeenCalledWith(dto.refreshToken);
      expect(result).toEqual(mockTokens);
    });
  });

  describe('logout', () => {
    it('should log out user and invalidate refresh token', async () => {
      const dto: RefreshTokenDto = {
        refreshToken: 'refresh-token-abc',
      };
      const expectedMessage = { message: 'Logged out successfully.' };
      authService.logout.mockResolvedValue(expectedMessage);

      const result = await controller.logout(mockUser, dto);

      expect(authService.logout).toHaveBeenCalledWith(
        mockUser.id,
        dto.refreshToken,
      );
      expect(result).toEqual(expectedMessage);
    });
  });

  describe('me', () => {
    it('should return current user information', () => {
      const result = controller.me(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('googleLogin', () => {
    it('should call authService.loginWithGoogle and return the result', async () => {
      const dto = {
        idToken: 'test-id-token',
      };

      const expectedResponse = {
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

      authService.loginWithGoogle.mockResolvedValue(expectedResponse);

      const result = await controller.googleLogin(dto);

      expect(authService.loginWithGoogle).toHaveBeenCalledWith('test-id-token');
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword', async () => {
      const dto = { email: 'user@example.com' };
      const expectedResponse = { message: 'Đường dẫn khôi phục mật khẩu đã được gửi qua email.' };
      authService.forgotPassword.mockResolvedValue(expectedResponse);

      const result = await controller.forgotPassword(dto);

      expect(authService.forgotPassword).toHaveBeenCalledWith(dto.email);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword', async () => {
      const dto = { token: 'reset-token', password: 'new-password' };
      const expectedResponse = { message: 'Mật khẩu đã được thay đổi thành công.' };
      authService.resetPassword.mockResolvedValue(expectedResponse);

      const result = await controller.resetPassword(dto);

      expect(authService.resetPassword).toHaveBeenCalledWith(dto.token, dto.password);
      expect(result).toEqual(expectedResponse);
    });
  });
});

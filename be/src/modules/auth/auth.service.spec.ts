import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

const mockVerifyIdToken = jest.fn();

jest.mock('google-auth-library', () => {
  return {
    OAuth2Client: jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: mockVerifyIdToken,
      };
    }),
  };
});

const sha256 = (value: string): string =>
  createHash('sha256').update(value).digest('hex');

const buildUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    role: UserRole.LEARNER,
    level: 1,
    xp: 0,
    streakDays: 0,
    ...overrides,
  }) as User;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<
    Pick<
      UsersService,
      'findById' | 'findByEmail' | 'findByEmailWithPassword' | 'create'
    >
  >;
  let refreshTokenRepository: jest.Mocked<
    Pick<Repository<RefreshToken>, 'create' | 'save' | 'findOne' | 'delete'>
  >;
  let userRepository: jest.Mocked<
    Pick<Repository<User>, 'findOne' | 'create' | 'save' | 'update'>
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync' | 'verifyAsync'>>;

  let allowedDomainSetting: string | undefined = 'company.com';
  let googleClientIdSetting: string | undefined = 'mock-google-client-id';

  beforeEach(async () => {
    allowedDomainSetting = 'company.com';
    googleClientIdSetting = 'mock-google-client-id';

    usersService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      create: jest.fn(),
    };
    refreshTokenRepository = {
      create: jest.fn((dto) => dto as RefreshToken),
      save: jest.fn((entity) => Promise.resolve(entity as RefreshToken)),
      findOne: jest.fn(),
      delete: jest.fn(() => Promise.resolve({ affected: 1, raw: [] })),
    };
    userRepository = {
      findOne: jest.fn(),
      create: jest.fn((dto) => ({ id: 'generated-uuid', ...dto }) as User),
      save: jest.fn((entity) => Promise.resolve(entity as User)),
      update: jest.fn(() => Promise.resolve({ affected: 1, raw: [] })),
    };
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    const configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (key === 'ALLOWED_EMAIL_DOMAIN') {
          return allowedDomainSetting;
        }
        if (key === 'GOOGLE_CLIENT_ID') {
          return googleClientIdSetting;
        }
        if (key === 'JWT_SECRET') {
          return 'access-secret';
        }
        if (key === 'JWT_REFRESH_SECRET') {
          return 'refresh-secret';
        }
        if (key === 'JWT_EXPIRES_IN') {
          return 900;
        }
        if (key === 'JWT_REFRESH_EXPIRES_IN') {
          return 604800;
        }
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('register', () => {
    it('hashes the password, persists the user and strips the hash from the result', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockImplementation((data) =>
        Promise.resolve(
          buildUser({ ...data, id: 'new-user', password: data.password }),
        ),
      );

      const result = await service.register({
        name: 'Test User',
        email: 'user@example.com',
        password: 'P@ssw0rd123',
      });

      const createdWith = usersService.create.mock.calls[0][0];
      expect(createdWith.password).not.toBe('P@ssw0rd123');
      expect(
        await bcrypt.compare('P@ssw0rd123', createdWith.password as string),
      ).toBe(true);
      expect((result as Partial<User>).password).toBeUndefined();
      expect(result.email).toBe('user@example.com');
    });

    it('rejects a duplicate email with 400 Bad Request', async () => {
      usersService.findByEmail.mockResolvedValue(buildUser());

      await expect(
        service.register({
          name: 'Test User',
          email: 'user@example.com',
          password: 'P@ssw0rd123',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(usersService.create).not.toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('returns the user when the password matches', async () => {
      const hash = await bcrypt.hash('P@ssw0rd123', 10);
      usersService.findByEmailWithPassword.mockResolvedValue(
        buildUser({ password: hash }),
      );

      await expect(
        service.validateUser('user@example.com', 'P@ssw0rd123'),
      ).resolves.toMatchObject({
        id: 'user-1',
      });
    });

    it('returns null when the user does not exist', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);
      await expect(
        service.validateUser('nope@example.com', 'whatever'),
      ).resolves.toBeNull();
    });

    it('returns null when the user has no local password', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(
        buildUser({ password: undefined }),
      );
      await expect(
        service.validateUser('user@example.com', 'whatever'),
      ).resolves.toBeNull();
    });

    it('returns null when the password is wrong', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      usersService.findByEmailWithPassword.mockResolvedValue(
        buildUser({ password: hash }),
      );
      await expect(
        service.validateUser('user@example.com', 'wrong-password'),
      ).resolves.toBeNull();
    });
  });

  describe('login', () => {
    it('issues an access/refresh pair and persists a hashed refresh handle', async () => {
      const hash = await bcrypt.hash('P@ssw0rd123', 10);
      usersService.findByEmailWithPassword.mockResolvedValue(
        buildUser({ password: hash }),
      );
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const result = await service.login({
        email: 'user@example.com',
        password: 'P@ssw0rd123',
      });

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 900,
      });
      const savedRow = refreshTokenRepository.save.mock
        .calls[0][0] as RefreshToken;
      expect(savedRow.token).toBe(sha256('refresh-token'));
      expect(savedRow.userId).toBe('user-1');
      expect(savedRow.expiresAt.getTime()).toBeGreaterThan(Date.now());
      // The persisted handle is keyed by the refresh token's jti claim.
      const refreshPayload = jwtService.signAsync.mock.calls[1][0] as {
        jti: string;
      };
      expect(savedRow.id).toBe(refreshPayload.jti);
    });

    it('issues refresh token with shorter expiry when rememberMe is false', async () => {
      const hash = await bcrypt.hash('P@ssw0rd123', 10);
      usersService.findByEmailWithPassword.mockResolvedValue(
        buildUser({ password: hash }),
      );
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.login({
        email: 'user@example.com',
        password: 'P@ssw0rd123',
        rememberMe: false,
      });

      const savedRow = refreshTokenRepository.save.mock
        .calls[0][0] as RefreshToken;
      const expectedExpiry = Date.now() + 86400 * 1000;
      expect(
        Math.abs(savedRow.expiresAt.getTime() - expectedExpiry),
      ).toBeLessThan(5000);
      const refreshPayload = jwtService.signAsync.mock.calls[1][0] as {
        rememberMe: boolean;
      };
      expect(refreshPayload.rememberMe).toBe(false);
    });

    it('issues refresh token with default expiry when rememberMe is true', async () => {
      const hash = await bcrypt.hash('P@ssw0rd123', 10);
      usersService.findByEmailWithPassword.mockResolvedValue(
        buildUser({ password: hash }),
      );
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.login({
        email: 'user@example.com',
        password: 'P@ssw0rd123',
        rememberMe: true,
      });

      const savedRow = refreshTokenRepository.save.mock
        .calls[0][0] as RefreshToken;
      const expectedExpiry = Date.now() + 604800 * 1000;
      expect(
        Math.abs(savedRow.expiresAt.getTime() - expectedExpiry),
      ).toBeLessThan(5000);
      const refreshPayload = jwtService.signAsync.mock.calls[1][0] as {
        rememberMe: boolean;
      };
      expect(refreshPayload.rememberMe).toBe(true);
    });

    it('rejects invalid credentials with 401', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);
      await expect(
        service.login({ email: 'user@example.com', password: 'wrong' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    const token = 'valid-refresh-token';
    const payload = { sub: 'user-1', jti: 'jti-1' };

    it('rotates the token: revokes the old handle and issues a new pair', async () => {
      jwtService.verifyAsync.mockResolvedValue(payload);
      refreshTokenRepository.findOne.mockResolvedValue({
        id: 'jti-1',
        userId: 'user-1',
        token: sha256(token),
      } as RefreshToken);
      usersService.findById.mockResolvedValue(buildUser());
      jwtService.signAsync
        .mockResolvedValueOnce('new-access')
        .mockResolvedValueOnce('new-refresh');

      const result = await service.refresh(token);

      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
        id: 'jti-1',
      });
      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        expiresIn: 900,
      });
    });

    it('rejects a token that fails signature/expiry verification with 401', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));
      await expect(service.refresh(token)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(refreshTokenRepository.delete).not.toHaveBeenCalled();
    });

    it('rejects an unknown / already-rotated token with 401', async () => {
      jwtService.verifyAsync.mockResolvedValue(payload);
      refreshTokenRepository.findOne.mockResolvedValue(null);
      await expect(service.refresh(token)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects when the stored hash does not match the presented token', async () => {
      jwtService.verifyAsync.mockResolvedValue(payload);
      refreshTokenRepository.findOne.mockResolvedValue({
        id: 'jti-1',
        userId: 'user-1',
        token: sha256('a-different-token'),
      } as RefreshToken);
      await expect(service.refresh(token)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects when the underlying user no longer exists', async () => {
      jwtService.verifyAsync.mockResolvedValue(payload);
      refreshTokenRepository.findOne.mockResolvedValue({
        id: 'jti-1',
        userId: 'user-1',
        token: sha256(token),
      } as RefreshToken);
      usersService.findById.mockResolvedValue(null);
      await expect(service.refresh(token)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('revokes the refresh token row belonging to the caller', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', jti: 'jti-1' });
      const result = await service.logout('user-1', 'refresh-token');
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith({
        id: 'jti-1',
        userId: 'user-1',
      });
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('is a silent no-op for an invalid token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));
      const result = await service.logout('user-1', 'garbage');
      expect(refreshTokenRepository.delete).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('does not delete a token that belongs to a different user', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'someone-else',
        jti: 'jti-9',
      });
      await service.logout('user-1', 'refresh-token');
      expect(refreshTokenRepository.delete).not.toHaveBeenCalled();
    });
  });
  describe('googleClientId not configured', () => {
    it('should throw InternalServerErrorException if GOOGLE_CLIENT_ID is empty', async () => {
      service['googleClientId'] = '';
      await expect(service.loginWithGoogle('some-token')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('verifyGoogleToken failures', () => {
    it('should throw UnauthorizedException if verifyIdToken fails', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.loginWithGoogle('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if getPayload returns null', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => null,
      });

      await expect(
        service.loginWithGoogle('null-payload-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if email is missing in payload', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email_verified: true,
          sub: '12345',
        }),
      });

      await expect(service.loginWithGoogle('no-email-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if email_verified is not true', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'user@company.com',
          email_verified: false,
          sub: '12345',
        }),
      });

      await expect(
        service.loginWithGoogle('unverified-email-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('assertAllowedDomain (email domain validation)', () => {
    it('should allow any email if ALLOWED_EMAIL_DOMAIN is not configured', async () => {
      service['allowedDomain'] = undefined;

      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'user@gmail.com',
          email_verified: true,
          sub: '12345',
          name: 'Regular User',
        }),
      });

      userRepository.findOne.mockResolvedValue(null);
      jwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await service.loginWithGoogle('valid-token');
      expect(result).toBeDefined();
      expect(result.user.email).toBe('user@gmail.com');
    });

    it('should allow email matching the ALLOWED_EMAIL_DOMAIN suffix', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'user@company.com',
          email_verified: true,
          sub: '12345',
          name: 'Company User',
        }),
      });

      userRepository.findOne.mockResolvedValue(null);
      jwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await service.loginWithGoogle('valid-token');
      expect(result).toBeDefined();
      expect(result.user.email).toBe('user@company.com');
    });

    it('should allow email matching ALLOWED_EMAIL_DOMAIN case-insensitively', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'user@CoMpAnY.cOm',
          email_verified: true,
          sub: '12345',
          name: 'Company User Case',
        }),
      });

      userRepository.findOne.mockResolvedValue(null);
      jwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await service.loginWithGoogle('valid-token');
      expect(result.user.email).toBe('user@CoMpAnY.cOm');
    });

    it('should allow email if hd claim matches ALLOWED_EMAIL_DOMAIN even if email suffix does not match', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'user@external.com',
          email_verified: true,
          sub: '12345',
          name: 'External Contractor',
          hd: 'company.com',
        }),
      });

      userRepository.findOne.mockResolvedValue(null);
      jwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await service.loginWithGoogle('valid-token');
      expect(result.user.email).toBe('user@external.com');
    });

    it('should throw ForbiddenException if neither email suffix nor hd claim match ALLOWED_EMAIL_DOMAIN', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'user@gmail.com',
          email_verified: true,
          sub: '12345',
          name: 'Unauthorized User',
          hd: 'gmail.com',
        }),
      });

      await expect(
        service.loginWithGoogle('unauthorized-token'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOrCreateUser and JWT generation', () => {
    beforeEach(() => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'user@company.com',
          email_verified: true,
          sub: 'google-sub-123',
          name: 'Test Name',
        }),
      });
      jwtService.signAsync.mockResolvedValue('mock-jwt-token');
    });

    it('should create a new account with default values when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.loginWithGoogle('valid-token');

      expect(userRepository.create).toHaveBeenCalledWith({
        email: 'user@company.com',
        name: 'Test Name',
        googleId: 'google-sub-123',
        role: UserRole.LEARNER,
        level: 1,
        xp: 0,
        streakDays: 0,
      });
      expect(userRepository.save).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: 'generated-uuid',
        email: 'user@company.com',
        name: 'Test Name',
        role: UserRole.LEARNER,
        level: 1,
        xp: 0,
        streakDays: 0,
      });
    });

    it('should fallback to local-part of email for name if name is missing in google payload', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'john.doe@company.com',
          email_verified: true,
          sub: 'google-sub-123',
        }),
      });

      userRepository.findOne.mockResolvedValue(null);

      const result = await service.loginWithGoogle('valid-token');

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'john.doe',
        }),
      );
      expect(result.user.name).toBe('john.doe');
    });

    it('should link googleId to existing user if user exists without googleId', async () => {
      const existingUser: User = {
        id: 'existing-uuid',
        email: 'user@company.com',
        name: 'Existing Name',
        role: UserRole.LEARNER,
        level: 5,
        xp: 120,
        streakDays: 3,
        cohortId: null,
        cohort: null,
        trackProgresses: [],
        submissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      userRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.loginWithGoogle('valid-token');

      expect(userRepository.create).not.toHaveBeenCalled();
      expect(existingUser.googleId).toBe('google-sub-123');
      expect(userRepository.save).toHaveBeenCalledWith(existingUser);
      expect(result.user).toEqual({
        id: 'existing-uuid',
        email: 'user@company.com',
        name: 'Existing Name',
        role: UserRole.LEARNER,
        level: 5,
        xp: 120,
        streakDays: 3,
      });
    });

    it('should not save or create user if user already has correct googleId', async () => {
      const existingUser: User = {
        id: 'existing-uuid',
        email: 'user@company.com',
        name: 'Existing Name',
        googleId: 'google-sub-123',
        role: UserRole.LEARNER,
        level: 5,
        xp: 120,
        streakDays: 3,
        cohortId: null,
        cohort: null,
        trackProgresses: [],
        submissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      userRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.loginWithGoogle('valid-token');

      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(result.user.id).toBe('existing-uuid');
    });
  });

  describe('forgotPassword / resetPassword', () => {
    describe('forgotPassword', () => {
      it('should throw BadRequestException if email does not exist', async () => {
        usersService.findByEmail.mockResolvedValue(null);

        await expect(
          service.forgotPassword('nonexistent@company.com'),
        ).rejects.toThrow(BadRequestException);
      });

      it('should generate token, set expiry and update user, logging mock email', async () => {
        const user = buildUser({ id: 'user-123', email: 'user@company.com' });
        usersService.findByEmail.mockResolvedValue(user);

        const result = await service.forgotPassword('user@company.com');

        expect(result).toEqual({
          message: 'Đường dẫn khôi phục mật khẩu đã được gửi qua email.',
        });
        expect(userRepository.update).toHaveBeenCalledWith(
          'user-123',
          expect.objectContaining({
            resetPasswordToken: expect.any(String),
            resetPasswordExpires: expect.any(Date),
          }),
        );
      });
    });

    describe('resetPassword', () => {
      it('should throw BadRequestException if token is invalid', async () => {
        userRepository.findOne.mockResolvedValue(null);

        await expect(
          service.resetPassword('invalid-token', 'new-password'),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException if token is expired', async () => {
        const expiredDate = new Date();
        expiredDate.setHours(expiredDate.getHours() - 2); // 2 hours ago
        const user = buildUser({
          id: 'user-123',
          resetPasswordExpires: expiredDate,
        });
        userRepository.findOne.mockResolvedValue(user);

        await expect(
          service.resetPassword('expired-token', 'new-password'),
        ).rejects.toThrow(BadRequestException);
      });

      it('should hash new password, clear token/expiry, and update user', async () => {
        const futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + 1); // 1 hour in future
        const user = buildUser({
          id: 'user-123',
          resetPasswordExpires: futureDate,
        });
        userRepository.findOne.mockResolvedValue(user);

        const result = await service.resetPassword(
          'valid-token',
          'NewSecurePassword123',
        );

        expect(result).toEqual({
          message: 'Mật khẩu đã được thay đổi thành công.',
        });
        expect(userRepository.update).toHaveBeenCalledWith(
          'user-123',
          expect.objectContaining({
            password: expect.any(String),
            resetPasswordToken: null,
            resetPasswordExpires: null,
          }),
        );
      });
    });
  });
});

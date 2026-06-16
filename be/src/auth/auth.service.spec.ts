import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, UserRole } from '../database/entities/user.entity';

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

describe('AuthService', () => {
  let service: AuthService;

  let allowedDomainSetting: string | undefined = 'company.com';
  let googleClientIdSetting: string | undefined = 'mock-google-client-id';

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation((dto: Partial<User>) => ({
      id: 'generated-uuid',
      ...dto,
    })),
    save: jest.fn().mockImplementation((user: User) => Promise.resolve(user)),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string): string | undefined => {
      if (key === 'ALLOWED_EMAIL_DOMAIN') {
        return allowedDomainSetting;
      }
      if (key === 'GOOGLE_CLIENT_ID') {
        return googleClientIdSetting;
      }
      if (key === 'JWT_REFRESH_SECRET') {
        return 'mock-refresh-secret';
      }
      if (key === 'JWT_REFRESH_EXPIRES_IN') {
        return '604800';
      }
      return defaultValue;
    }),
  };

  const createService = async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    allowedDomainSetting = 'company.com';
    googleClientIdSetting = 'mock-google-client-id';

    // Set up default implementation resets
    mockUserRepository.findOne.mockReset();
    mockUserRepository.create
      .mockReset()
      .mockImplementation((dto: Partial<User>) => ({
        id: 'generated-uuid',
        ...dto,
      }));
    mockUserRepository.save
      .mockReset()
      .mockImplementation((user: User) => Promise.resolve(user));

    await createService();
  });

  describe('googleClientId not configured', () => {
    it('should throw InternalServerErrorException if GOOGLE_CLIENT_ID is empty', async () => {
      googleClientIdSetting = '';
      await createService();

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
      allowedDomainSetting = undefined;
      await createService();

      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'user@gmail.com',
          email_verified: true,
          sub: '12345',
          name: 'Regular User',
        }),
      });

      mockUserRepository.findOne.mockResolvedValue(null);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

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

      mockUserRepository.findOne.mockResolvedValue(null);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

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

      mockUserRepository.findOne.mockResolvedValue(null);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

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

      mockUserRepository.findOne.mockResolvedValue(null);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

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
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');
    });

    it('should create a new account with default values when user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.loginWithGoogle('valid-token');

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email: 'user@company.com',
        name: 'Test Name',
        googleId: 'google-sub-123',
        role: UserRole.LEARNER,
        level: 1,
        xp: 0,
        streakDays: 0,
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
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

      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.loginWithGoogle('valid-token');

      expect(mockUserRepository.create).toHaveBeenCalledWith(
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
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.loginWithGoogle('valid-token');

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(existingUser.googleId).toBe('google-sub-123');
      expect(mockUserRepository.save).toHaveBeenCalledWith(existingUser);
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
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      const result = await service.loginWithGoogle('valid-token');

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(result.user.id).toBe('existing-uuid');
    });
  });
});

import { BadRequestException, UnauthorizedException } from '@nestjs/common';
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
  let jwtService: jest.Mocked<Pick<JwtService, 'signAsync' | 'verifyAsync'>>;

  beforeEach(async () => {
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
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    const config: Record<string, string | number> = {
      JWT_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_EXPIRES_IN: 900,
      JWT_REFRESH_EXPIRES_IN: 604800,
    };
    const configService = {
      get: jest.fn((key: string, fallback?: unknown) =>
        key in config ? config[key] : fallback,
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepository,
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
});

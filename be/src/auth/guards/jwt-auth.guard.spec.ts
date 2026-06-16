import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserRole } from '../../database/entities/user.entity';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  const createMockExecutionContext = (authHeader?: string) => {
    const request = {
      headers: {
        authorization: authHeader,
      },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw UnauthorizedException if authorization header is missing', async () => {
    const context = createMockExecutionContext(undefined);
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Thiếu access token.'),
    );
  });

  it('should throw UnauthorizedException if authorization header is not Bearer', async () => {
    const context = createMockExecutionContext('Basic some-token');
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Thiếu access token.'),
    );
  });

  it('should throw UnauthorizedException if jwtService.verifyAsync fails', async () => {
    const context = createMockExecutionContext('Bearer invalid-token');
    mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Access token không hợp lệ hoặc đã hết hạn.'),
    );
  });

  it('should attach payload to request.user and return true if token is valid', async () => {
    const request = {
      headers: {
        authorization: 'Bearer valid-token',
      },
      user: undefined as JwtPayload | undefined,
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;

    const mockPayload: JwtPayload = {
      sub: 'user-uuid',
      email: 'user@company.com',
      role: UserRole.LEARNER,
    };
    mockJwtService.verifyAsync.mockResolvedValue(mockPayload);

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toEqual(mockPayload);
    expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
  });
});

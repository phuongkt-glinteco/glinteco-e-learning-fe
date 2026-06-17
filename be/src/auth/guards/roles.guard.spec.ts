import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserRole } from '../../database/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, Reflector],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  const createContext = (user?: JwtPayload) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as unknown as ExecutionContext;

  const adminUser: JwtPayload = {
    sub: 'admin-uuid',
    email: 'admin@company.com',
    role: UserRole.ADMIN,
  };
  const learnerUser: JwtPayload = {
    sub: 'learner-uuid',
    email: 'learner@company.com',
    role: UserRole.LEARNER,
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow when no roles metadata is set', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(createContext(learnerUser))).toBe(true);
  });

  it('should allow when required roles array is empty', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
    expect(guard.canActivate(createContext(learnerUser))).toBe(true);
  });

  it('should allow when the user has a required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);
    expect(guard.canActivate(createContext(adminUser))).toBe(true);
  });

  it('should throw ForbiddenException when the user lacks the required role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);
    expect(() => guard.canActivate(createContext(learnerUser))).toThrow(
      ForbiddenException,
    );
  });

  it('should fail closed (Forbidden) when no principal is attached', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue([UserRole.ADMIN]);
    expect(() => guard.canActivate(createContext(undefined))).toThrow(
      new ForbiddenException('Không xác định được người dùng.'),
    );
  });
});

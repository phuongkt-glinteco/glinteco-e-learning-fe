import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../../database/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockExecutionContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard, { provide: Reflector, useValue: mockReflector }],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      mockReflector.getAllAndOverride.mockReturnValue(null);
      const context = mockExecutionContext as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException if user is not present', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockExecutionContext.getRequest.mockReturnValue({});
      const context = mockExecutionContext as unknown as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user has incorrect role', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockExecutionContext.getRequest.mockReturnValue({
        user: { role: UserRole.LEARNER },
      });
      const context = mockExecutionContext as unknown as ExecutionContext;

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should return true if user has correct role', () => {
      mockReflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      mockExecutionContext.getRequest.mockReturnValue({
        user: { role: UserRole.ADMIN },
      });
      const context = mockExecutionContext as unknown as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
    });
  });
});

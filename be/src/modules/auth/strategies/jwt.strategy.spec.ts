import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from '../../users/users.service';
import { User } from '../../../database/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<Pick<UsersService, 'findById'>>;
  let configService: jest.Mocked<Pick<ConfigService, 'get'>>;

  const mockUser = {
    id: 'user-id-123',
    email: 'test@example.com',
    name: 'Test User',
  } as User;

  beforeEach(async () => {
    usersService = {
      findById: jest.fn(),
    };
    configService = {
      get: jest.fn().mockReturnValue('super-secret-jwt-key-for-ramp-up'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UsersService, useValue: usersService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should return the user if found', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await strategy.validate({
        sub: 'user-id-123',
        email: 'test@example.com',
      });

      expect(usersService.findById).toHaveBeenCalledWith('user-id-123');
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(
        strategy.validate({ sub: 'user-id-123', email: 'test@example.com' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(usersService.findById).toHaveBeenCalledWith('user-id-123');
    });
  });
});

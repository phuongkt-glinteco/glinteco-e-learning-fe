import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LeaderboardService } from './leaderboard.service';
import { User, UserRole } from '../database/entities/user.entity';
import {
  LeaderboardQueryDto,
  LeaderboardScope,
} from './dto/leaderboard-query.dto';
import { BadRequestException } from '@nestjs/common';

describe('LeaderboardService', () => {
  let service: LeaderboardService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
  };

  const mockUserRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getLeaderboard', () => {
    it('should throw BadRequestException if scope is cohort and user is not in any cohort', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-1',
        cohortId: null,
      });
      const query: LeaderboardQueryDto = { scope: LeaderboardScope.COHORT };

      await expect(service.getLeaderboard(query, 'user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return global leaderboard without cursor', async () => {
      const query: LeaderboardQueryDto = {
        scope: LeaderboardScope.GLOBAL,
        limit: 2,
      };
      const now = new Date();
      const users = [
        {
          id: 'user-1',
          name: 'Learner 1',
          level: 3,
          xp: 1500,
          streakDays: 5,
          createdAt: now,
        },
        {
          id: 'user-2',
          name: 'Learner 2',
          level: 2,
          xp: 800,
          streakDays: 3,
          createdAt: now,
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(users);
      mockQueryBuilder.getCount.mockResolvedValue(0); // higherCount is 0, so rank starts at 1

      const result = await service.getLeaderboard(query, 'user-3');

      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalledWith(
        'user',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.role = :role', {
        role: UserRole.LEARNER,
      });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].rank).toBe(1);
      expect(result.data[1].rank).toBe(2);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeNull();
    });

    it('should handle pagination with hasMore and return nextCursor', async () => {
      const query: LeaderboardQueryDto = {
        scope: LeaderboardScope.GLOBAL,
        limit: 1,
      };
      const now = new Date();
      const users = [
        {
          id: 'user-1',
          name: 'Learner 1',
          level: 3,
          xp: 1500,
          streakDays: 5,
          createdAt: now,
        },
        {
          id: 'user-2',
          name: 'Learner 2',
          level: 2,
          xp: 800,
          streakDays: 3,
          createdAt: now,
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(users);
      mockQueryBuilder.getCount.mockResolvedValue(0);

      const result = await service.getLeaderboard(query, 'user-3');
      expect(result.data).toHaveLength(1);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBeDefined();

      const decoded = JSON.parse(
        Buffer.from(result.nextCursor!, 'base64').toString('ascii'),
      ) as { id: string; level: number };
      expect(decoded.id).toBe('user-1');
      expect(decoded.level).toBe(3);
    });

    it('should filter based on decoded cursor', async () => {
      const cursorPayload = {
        level: 3,
        xp: 1500,
        streakDays: 5,
        createdAt: new Date().toISOString(),
        id: 'user-1',
      };
      const cursor = Buffer.from(JSON.stringify(cursorPayload)).toString(
        'base64',
      );
      const query: LeaderboardQueryDto = {
        scope: LeaderboardScope.GLOBAL,
        limit: 2,
        cursor,
      };

      mockQueryBuilder.getMany.mockResolvedValue([]);
      mockQueryBuilder.getCount.mockResolvedValue(0);

      await service.getLeaderboard(query, 'user-3');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('user.level < :level'),
        expect.objectContaining({ level: 3, xp: 1500, streakDays: 5 }),
      );
    });

    it('should calculate ranks relative to higher level users count', async () => {
      const query: LeaderboardQueryDto = {
        scope: LeaderboardScope.GLOBAL,
        limit: 2,
      };
      const now = new Date();
      const users = [
        {
          id: 'user-3',
          name: 'Learner 3',
          level: 2,
          xp: 700,
          streakDays: 2,
          createdAt: now,
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(users);
      mockQueryBuilder.getCount.mockResolvedValue(4); // 4 users rank higher

      const result = await service.getLeaderboard(query, 'user-3');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].rank).toBe(5); // rank starts at higherCount + 1 = 5
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import {
  LeaderboardQueryDto,
  LeaderboardScope,
} from './dto/leaderboard-query.dto';
import { LeaderboardResponseDto } from './dto/leaderboard-response.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';

describe('LeaderboardController', () => {
  let controller: LeaderboardController;

  const mockLeaderboardService = {
    getLeaderboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaderboardController],
      providers: [
        { provide: LeaderboardService, useValue: mockLeaderboardService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LeaderboardController>(LeaderboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLeaderboard', () => {
    it('should delegate getLeaderboard to LeaderboardService', async () => {
      const query: LeaderboardQueryDto = { scope: LeaderboardScope.GLOBAL };
      const req = { user: { id: 'user-1', role: 'learner' } };
      const expectedResult: LeaderboardResponseDto = {
        data: [],
        nextCursor: null,
        hasMore: false,
      };

      mockLeaderboardService.getLeaderboard.mockResolvedValue(expectedResult);

      const result = await controller.getLeaderboard(query, req);

      expect(mockLeaderboardService.getLeaderboard).toHaveBeenCalledWith(
        query,
        'user-1',
      );
      expect(result).toEqual(expectedResult);
    });
  });
});

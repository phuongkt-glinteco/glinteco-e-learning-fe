import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { LeaderboardResponseDto } from './dto/leaderboard-response.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';

interface RequestWithUser {
  user: {
    id: string;
    role: string;
  };
}

@ApiTags('leaderboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @ApiOperation({ summary: 'Lấy bảng xếp hạng thi đua học viên' })
  @ApiResponse({
    status: 200,
    type: LeaderboardResponseDto,
    description: 'Lấy bảng xếp hạng thành công.',
  })
  @Get()
  async getLeaderboard(
    @Query() query: LeaderboardQueryDto,
    @Req() req: RequestWithUser,
  ): Promise<LeaderboardResponseDto> {
    return this.leaderboardService.getLeaderboard(query, req.user.id);
  }
}

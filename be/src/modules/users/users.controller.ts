import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UnauthorizedException,
  ForbiddenException,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserDashboardStatsDto } from './dto/user-dashboard-stats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../../database/entities/user.entity';

interface RequestWithUser {
  user: {
    id: string;
    role: string;
  };
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Lấy danh sách người dùng (Admin only)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một người dùng (Admin hoặc chính chủ)',
  })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== id) {
      throw new ForbiddenException('Không có quyền truy cập hồ sơ này');
    }
    return this.usersService.findOneOrFail(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  async updateProfile(
    @CurrentUser() currentUser: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(currentUser.id, updateProfileDto);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Lấy chỉ số học tập để hiển thị trên Dashboard' })
  @ApiResponse({
    status: 200,
    type: UserDashboardStatsDto,
    description: 'Lấy chỉ số thành công.',
  })
  async getStats(
    @CurrentUser() currentUser: User,
  ): Promise<UserDashboardStatsDto> {
    return this.usersService.getStats(currentUser.id);
  }

  @Post('me/claim-xp')
  @ApiOperation({ summary: 'Điểm danh hàng ngày nhận XP và tích streak' })
  @ApiResponse({ status: 200, description: 'Điểm danh nhận XP thành công.' })
  @ApiResponse({ status: 400, description: 'Bạn đã nhận XP ngày hôm nay rồi.' })
  async claimDailyXp(@CurrentUser() currentUser: User) {
    return this.usersService.claimDailyXp(currentUser.id);
  }
}

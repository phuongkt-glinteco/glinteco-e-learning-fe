import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { TracksService } from './tracks.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Roles } from '../modules/auth/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';
import { AdminTrackListResponseDto } from './dto/admin-track-response.dto';

@ApiTags('admin-tracks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/tracks')
export class AdminTracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  @ApiOperation({
    summary:
      'Danh sách Lộ trình kèm thống kê cho Admin (GLI-94): học viên đang học, tỷ lệ hoàn thành, trạng thái',
  })
  @ApiResponse({
    status: 200,
    type: AdminTrackListResponseDto,
    description: 'Lấy danh sách thành công.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async adminList() {
    return this.tracksService.adminList();
  }
}

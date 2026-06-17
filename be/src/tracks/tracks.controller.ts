import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../database/entities/user.entity';
import { ReorderTracksDto } from './dto/reorder-tracks.dto';
import { ReorderTracksResponseDto } from './dto/reorder-tracks-response.dto';
import { TracksService } from './tracks.service';

@ApiTags('Tracks')
@ApiBearerAuth()
@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Patch('reorder')
  @HttpCode(HttpStatus.OK)
  // JwtAuthGuard runs first to populate request.user, then RolesGuard enforces
  // the admin-only restriction.
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: 'Sắp xếp lại thứ tự các Track trong timeline (Admin)',
    description:
      'Nhận một mảng UUID đại diện cho thứ tự mới của toàn bộ các track và ' +
      'cập nhật lại trường order tương ứng. Yêu cầu danh sách bao gồm đầy đủ ' +
      'tất cả các track hiện có.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: ReorderTracksResponseDto })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai access token.' })
  @ApiForbiddenResponse({ description: 'Người dùng không phải Admin.' })
  @ApiNotFoundResponse({
    description: 'Một hoặc nhiều track id không tồn tại.',
  })
  async reorder(
    @Body() dto: ReorderTracksDto,
  ): Promise<ReorderTracksResponseDto> {
    return this.tracksService.reorder(dto);
  }
}

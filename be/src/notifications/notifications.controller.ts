import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../modules/auth/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo của người dùng hiện tại' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công.' })
  findAll(@CurrentUser() currentUser: User) {
    return this.notificationsService.findAll(currentUser.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Đánh dấu thông báo đã đọc theo ID' })
  @ApiResponse({ status: 200, description: 'Đánh dấu thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thông báo.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  markRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.notificationsService.markRead(id, currentUser.id);
  }
}

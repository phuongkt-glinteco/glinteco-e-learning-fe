import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TracksService } from './tracks.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { ReorderTracksDto } from './dto/reorder-tracks.dto';
import { UpdateTrackProgressDto } from './dto/update-track-progress.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Roles } from '../modules/auth/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

interface RequestWithUser {
  user: {
    id: string;
    role: string;
  };
}

@ApiTags('tracks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @ApiOperation({
    summary: 'Lấy tất cả các tracks kèm theo tiến độ học của learner hiện tại',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách tracks thành công.' })
  @Get()
  async findAll(@Req() req: RequestWithUser) {
    return this.tracksService.findAll(req.user.id);
  }

  @ApiOperation({ summary: 'Sắp xếp lại các tracks' })
  @ApiResponse({
    status: 200,
    description: 'Sắp xếp lại thứ tự tracks thành công.',
  })
  @Roles(UserRole.ADMIN)
  @Patch('reorder')
  async reorder(@Body() reorderTracksDto: ReorderTracksDto) {
    return this.tracksService.reorder(reorderTracksDto);
  }

  @ApiOperation({ summary: 'Lấy thông tin chi tiết một track' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết track thành công.' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tracksService.findOne(id, req.user.id);
  }

  @ApiOperation({ summary: 'Tạo track mới (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tạo track thành công.' })
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createTrackDto: CreateTrackDto) {
    return this.tracksService.create(createTrackDto);
  }

  @ApiOperation({ summary: 'Cập nhật track (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật track thành công.' })
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTrackDto: UpdateTrackDto,
  ) {
    return this.tracksService.update(id, updateTrackDto);
  }

  @ApiOperation({ summary: 'Xóa track (Admin only)' })
  @ApiResponse({ status: 204, description: 'Xóa track thành công.' })
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.tracksService.delete(id);
  }

  @ApiOperation({ summary: 'Cập nhật trạng thái tiến độ học của track' })
  @ApiResponse({ status: 200, description: 'Cập nhật tiến độ thành công.' })
  @Patch(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() updateTrackProgressDto: UpdateTrackProgressDto,
  ) {
    return this.tracksService.updateTrackProgress(
      id,
      req.user.id,
      updateTrackProgressDto.status,
    );
  }
}

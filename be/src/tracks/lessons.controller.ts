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
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
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

@ApiTags('lessons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class LessonsController {
  constructor(private readonly tracksService: TracksService) {}

  @ApiOperation({ summary: 'Lấy danh sách các bài học thuộc track' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách bài học thành công.',
  })
  @Get('tracks/:id/lessons')
  async findLessons(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tracksService.findLessons(id, req.user.id);
  }

  @ApiOperation({ summary: 'Tạo bài học mới trong track (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tạo bài học thành công.' })
  @Roles(UserRole.ADMIN)
  @Post('tracks/:id/lessons')
  async createLesson(
    @Param('id') trackId: string,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.tracksService.createLesson(trackId, createLessonDto);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin bài học (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật bài học thành công.' })
  @Roles(UserRole.ADMIN)
  @Patch('lessons/:id')
  async updateLesson(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.tracksService.updateLesson(id, updateLessonDto);
  }

  @ApiOperation({ summary: 'Xóa bài học (Admin only)' })
  @ApiResponse({ status: 204, description: 'Xóa bài học thành công.' })
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('lessons/:id')
  async deleteLesson(@Param('id') id: string) {
    return this.tracksService.deleteLesson(id);
  }

  @ApiOperation({ summary: 'Đánh dấu hoàn thành bài học và nhận XP' })
  @ApiResponse({ status: 200, description: 'Hoàn thành bài học thành công.' })
  @Post('lessons/:id/complete')
  async completeLesson(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tracksService.completeLesson(id, req.user.id);
  }
}

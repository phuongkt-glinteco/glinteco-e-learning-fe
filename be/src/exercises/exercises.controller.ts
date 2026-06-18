import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseQueryDto } from './dto/exercise-query.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Roles } from '../modules/auth/decorators/roles.decorator';
import { CurrentUser } from '../modules/auth/decorators/current-user.decorator';
import { User, UserRole } from '../database/entities/user.entity';

@ApiTags('exercises')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exercises')
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo mới một bài tập thực hành (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tạo bài tập thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bài tập thực hành kèm trạng thái bài nộp cá nhân' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công.' })
  findAll(
    @Query() query: ExerciseQueryDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.exercisesService.findAll(query, currentUser.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết bài tập theo ID' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.exercisesService.findOne(id, currentUser.id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cập nhật thông tin bài tập (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exercisesService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Xóa bài tập theo ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài tập.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.exercisesService.remove(id);
  }
}

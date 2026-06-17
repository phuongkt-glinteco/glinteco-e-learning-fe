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
  ApiQuery,
} from '@nestjs/swagger';
import { CohortService } from './cohort.service';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Roles } from '../modules/auth/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';

@ApiTags('cohorts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('cohorts')
export class CohortController {
  constructor(private readonly cohortService: CohortService) {}

  @Post()
  @ApiOperation({ summary: 'Khởi tạo một Cohort mới (Admin only)' })
  @ApiResponse({ status: 201, description: 'Khởi tạo thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  create(@Body() createCohortDto: CreateCohortDto) {
    return this.cohortService.create(createCohortDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách Cohort với phân trang (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.cohortService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết của Cohort theo ID (Admin only)',
  })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy Cohort.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cohortService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật thông tin Cohort (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy Cohort.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCohortDto: UpdateCohortDto,
  ) {
    return this.cohortService.update(id, updateCohortDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa Cohort theo ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công.' })
  @ApiResponse({
    status: 400,
    description: 'Không thể xóa do ràng buộc dữ liệu.',
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy Cohort.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.cohortService.remove(id);
  }
}

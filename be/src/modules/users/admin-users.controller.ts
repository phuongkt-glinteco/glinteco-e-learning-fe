import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../../database/entities/user.entity';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { AssignCohortDto } from './dto/assign-cohort.dto';

@ApiTags('admin-users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách người dùng cho Admin (phân trang, tìm kiếm, lọc)',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  async findAll(@Query() query: AdminUserQueryDto) {
    return this.usersService.adminList(query);
  }

  @Post()
  @ApiOperation({ summary: 'Admin tạo tài khoản người dùng mới' })
  @ApiResponse({ status: 201, description: 'Tạo tài khoản thành công.' })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại.' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.adminCreate(createUserDto);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Admin cập nhật vai trò và/hoặc cohort của người dùng (GLI-76)',
  })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công.' })
  @ApiResponse({
    status: 400,
    description: 'Yêu cầu không hợp lệ hoặc tự sửa vai trò của chính mình.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
    @Body() updateUserAdminDto: UpdateUserAdminDto,
  ) {
    return this.usersService.adminUpdate(
      currentUser.id,
      id,
      updateUserAdminDto,
    );
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Admin thay đổi vai trò của người dùng' })
  @ApiResponse({ status: 200, description: 'Thay đổi vai trò thành công.' })
  @ApiResponse({
    status: 400,
    description: 'Không thể tự đổi vai trò của chính mình.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async changeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.adminChangeRole(
      currentUser.id,
      id,
      updateUserRoleDto.role,
    );
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Admin bật/tắt trạng thái hoạt động của người dùng',
  })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công.' })
  @ApiResponse({
    status: 400,
    description: 'Không thể tự khóa tài khoản của chính mình.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.usersService.adminSetStatus(
      currentUser.id,
      id,
      updateUserStatusDto.isActive,
    );
  }

  @Post(':id/ban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin khóa tài khoản kèm lý do và thời gian hết hạn (GLI-85)',
  })
  @ApiResponse({ status: 200, description: 'Khóa tài khoản thành công.' })
  @ApiResponse({
    status: 400,
    description: 'Không thể tự khóa tài khoản của chính mình.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async banUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
    @Body() banUserDto: BanUserDto,
  ) {
    return this.usersService.adminBan(currentUser.id, id, banUserDto);
  }

  @Post(':id/unban')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin mở khóa tài khoản (GLI-85)' })
  @ApiResponse({ status: 200, description: 'Mở khóa tài khoản thành công.' })
  @ApiResponse({ status: 400, description: 'Không thể tự mở khóa chính mình.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async unbanUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    return this.usersService.adminUnban(currentUser.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Admin xóa tài khoản người dùng' })
  @ApiResponse({ status: 204, description: 'Xóa tài khoản thành công.' })
  @ApiResponse({
    status: 400,
    description: 'Không thể tự xóa tài khoản của chính mình.',
  })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy người dùng.' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
  ) {
    await this.usersService.adminDelete(currentUser.id, id);
  }

  @Patch(':id/cohort')
  @ApiOperation({ summary: 'Admin gán cohort cho người dùng' })
  @ApiResponse({ status: 200, description: 'Gán cohort thành công.' })
  @ApiResponse({ status: 400, description: 'Yêu cầu không hợp lệ.' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập.' })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy người dùng hoặc cohort.',
  })
  @ApiResponse({
    status: 409,
    description: 'Người dùng đã ở trong cohort này.',
  })
  async assignCohort(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: User,
    @Body() assignCohortDto: AssignCohortDto,
  ) {
    return this.usersService.adminAssignCohort(
      currentUser.id,
      id,
      assignCohortDto.cohortId,
    );
  }
}

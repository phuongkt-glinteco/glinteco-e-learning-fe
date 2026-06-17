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
import { DocumentsService } from './documents.service';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { BookmarkResponseDto } from './dto/bookmark-response.dto';
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

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @ApiOperation({ summary: 'Tìm kiếm và liệt kê tài liệu kỹ thuật' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách tài liệu thành công.',
  })
  @Get('documents')
  async findAll(
    @Query() query: SearchDocumentsDto,
    @Req() req: RequestWithUser,
  ) {
    return this.documentsService.findAll(query, req.user.id);
  }

  @ApiOperation({ summary: 'Lấy danh sách tài liệu được lưu gần đây' })
  @ApiResponse({ status: 200, description: 'Lấy tài liệu gần đây thành công.' })
  @Get('documents/recent')
  async findRecent(@Req() req: RequestWithUser) {
    return this.documentsService.findRecent(req.user.id);
  }

  @ApiOperation({ summary: 'Lấy thông tin chi tiết tài liệu kỹ thuật' })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết tài liệu thành công.',
  })
  @Get('documents/:id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.documentsService.findOne(id, req.user.id);
  }

  @ApiOperation({ summary: 'Thêm mới tài liệu kỹ thuật (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tạo tài liệu thành công.' })
  @Roles(UserRole.ADMIN)
  @Post('documents')
  async create(
    @Body() createDocDto: CreateDocumentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.documentsService.create(createDocDto, req.user.id);
  }

  @ApiOperation({ summary: 'Cập nhật tài liệu kỹ thuật (Admin only)' })
  @ApiResponse({ status: 200, description: 'Cập nhật tài liệu thành công.' })
  @Roles(UserRole.ADMIN)
  @Patch('documents/:id')
  async update(
    @Param('id') id: string,
    @Body() updateDocDto: UpdateDocumentDto,
    @Req() req: RequestWithUser,
  ) {
    return this.documentsService.update(id, updateDocDto, req.user.id);
  }

  @ApiOperation({ summary: 'Xóa tài liệu kỹ thuật (Admin only)' })
  @ApiResponse({ status: 204, description: 'Xóa tài liệu thành công.' })
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('documents/:id')
  async delete(@Param('id') id: string) {
    return this.documentsService.delete(id);
  }

  @ApiOperation({ summary: 'Đánh dấu lưu tài liệu để đọc sau' })
  @ApiResponse({
    status: 200,
    type: BookmarkResponseDto,
    description: 'Bookmark tài liệu thành công.',
  })
  @Post('documents/:id/bookmark')
  async bookmark(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<BookmarkResponseDto> {
    return this.documentsService.bookmark(id, req.user.id);
  }

  @ApiOperation({ summary: 'Bỏ lưu tài liệu' })
  @ApiResponse({ status: 204, description: 'Hủy bookmark thành công.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('documents/:id/bookmark')
  async unbookmark(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.documentsService.unbookmark(id, req.user.id);
  }

  // --- Tags Endpoints ---

  @ApiOperation({ summary: 'Lấy tất cả các thẻ phân loại (Tags)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách tags thành công.' })
  @Get('tags')
  async findAllTags() {
    return this.documentsService.findAllTags();
  }

  @ApiOperation({ summary: 'Tạo thẻ phân loại mới (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tạo tag thành công.' })
  @Roles(UserRole.ADMIN)
  @Post('tags')
  async createTag(@Body() createTagDto: CreateTagDto) {
    return this.documentsService.createTag(createTagDto);
  }

  @ApiOperation({ summary: 'Xóa thẻ phân loại (Admin only)' })
  @ApiResponse({ status: 204, description: 'Xóa tag thành công.' })
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('tags/:id')
  async deleteTag(@Param('id') id: string) {
    return this.documentsService.deleteTag(id);
  }
}

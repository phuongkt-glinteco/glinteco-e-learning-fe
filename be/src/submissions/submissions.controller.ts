import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { SubmissionQueryDto } from './dto/submission-query.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ReviewSubmissionDto } from './dto/review-submission.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { Roles } from '../modules/auth/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';
import { SubmissionStatus } from '../database/entities/submission.entity';

interface RequestWithUser {
  user: {
    id: string;
    role: string;
  };
}

@ApiTags('submissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @ApiOperation({
    summary: 'Lấy danh sách bài tập thuộc track kèm theo bài nộp',
  })
  @ApiResponse({ status: 200, description: 'Lấy bài tập thành công.' })
  @Get('tracks/:id/exercises')
  async findExercises(
    @Param('id') trackId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.submissionsService.findExercises(trackId, req.user.id);
  }

  @ApiOperation({ summary: 'Nộp bài tập lần đầu (PR GitHub)' })
  @ApiResponse({ status: 201, description: 'Nộp bài tập thành công.' })
  @Post('exercises/:id/submissions')
  async submit(
    @Param('id') exerciseId: string,
    @Body() dto: CreateSubmissionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.submissionsService.submit(exerciseId, req.user.id, dto.prUrl);
  }

  @ApiOperation({ summary: 'Nộp lại bài tập sau khi chỉnh sửa' })
  @ApiResponse({ status: 200, description: 'Nộp lại bài tập thành công.' })
  @Put('exercises/:id/submissions')
  async resubmit(
    @Param('id') exerciseId: string,
    @Body() dto: CreateSubmissionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.submissionsService.resubmit(exerciseId, req.user.id, dto.prUrl);
  }

  @ApiOperation({ summary: 'Hàng chờ chấm điểm bài tập (Admin only)' })
  @ApiResponse({ status: 200, description: 'Lấy hàng chờ thành công.' })
  @Roles(UserRole.ADMIN)
  @Get('submissions')
  async findAll(@Query() query: SubmissionQueryDto) {
    return this.submissionsService.findAll(query);
  }

  @ApiOperation({ summary: 'Lấy danh sách các bài nộp của learner hiện tại' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách bài nộp thành công.',
  })
  @Get('submissions/mine')
  async findMine(@Req() req: RequestWithUser) {
    return this.submissionsService.findAll({ userId: req.user.id });
  }

  @ApiOperation({ summary: 'Lấy chi tiết một bài nộp' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết bài nộp thành công.' })
  @Get('submissions/:id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.submissionsService.findOne(id, req.user.id, req.user.role);
  }

  @ApiOperation({ summary: 'Đánh giá bài nộp (Admin only)' })
  @ApiResponse({ status: 200, description: 'Đánh giá bài nộp thành công.' })
  @Roles(UserRole.ADMIN)
  @Post('submissions/:id/review')
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewSubmissionDto,
    @Req() req: RequestWithUser,
  ) {
    return this.submissionsService.review(
      id,
      req.user.id,
      dto.status,
      dto.comment,
    );
  }

  @ApiOperation({ summary: 'Phê duyệt bài tập (Admin only)' })
  @ApiResponse({ status: 200, description: 'Phê duyệt bài nộp thành công.' })
  @Roles(UserRole.ADMIN)
  @Post('submissions/:id/approve')
  async approve(
    @Param('id') id: string,
    @Body() body: { comment?: string },
    @Req() req: RequestWithUser,
  ) {
    return this.submissionsService.review(
      id,
      req.user.id,
      SubmissionStatus.APPROVED,
      body.comment,
    );
  }

  @ApiOperation({ summary: 'Yêu cầu sửa đổi bài tập (Admin only)' })
  @ApiResponse({ status: 200, description: 'Yêu cầu sửa đổi thành công.' })
  @Roles(UserRole.ADMIN)
  @Post('submissions/:id/request-changes')
  async requestChanges(
    @Param('id') id: string,
    @Body() body: { comment?: string },
    @Req() req: RequestWithUser,
  ) {
    return this.submissionsService.review(
      id,
      req.user.id,
      SubmissionStatus.CHANGES,
      body.comment,
    );
  }

  @ApiOperation({ summary: 'Lấy lịch sử chấm bài và nhận xét' })
  @ApiResponse({ status: 200, description: 'Lấy lịch sử thành công.' })
  @Get('submissions/:id/history')
  async findHistory(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.submissionsService.findHistory(id, req.user.id, req.user.role);
  }
}

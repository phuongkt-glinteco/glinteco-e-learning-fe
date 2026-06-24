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
import {
  SubmissionFeedItemDto,
  SubmissionListResponseDto,
  SubmissionDetailDto,
  SubmissionHistoryResponseDto,
} from './dto/submission-response.dto';
import { ExerciseDetailDto } from '../exercises/dto/exercise-response.dto';
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

  private mapToDetailDto(s: any): SubmissionDetailDto {
    const lastHistory = s.histories && s.histories.length > 0 ? s.histories[0] : null;
    return {
      id: s.id,
      exerciseId: s.exerciseId,
      exercise: s.exercise?.title || '',
      user: {
        id: s.user?.id || '',
        name: s.user?.name || '',
      },
      prUrl: s.prUrl || '',
      status: s.status,
      reviewerId: lastHistory?.adminId || null,
      reviewNote: lastHistory?.comment || null,
      submittedAt: s.submittedAt,
      reviewedAt: lastHistory?.createdAt || null,
    };
  }

  private mapToListDto(result: { data: any[]; nextCursor: string | null; hasMore: boolean }): SubmissionListResponseDto {
    return {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      data: result.data.map((s) => ({
        id: s.id,
        user: {
          id: s.user?.id || '',
          name: s.user?.name || '',
          avatarHue: s.user?.avatarHue ?? undefined,
        },
        exercise: {
          id: s.exercise?.id || '',
          title: s.exercise?.title || '',
          trackId: s.exercise?.trackId || '',
          track: s.exercise?.track?.title || '',
          tag: s.exercise?.tag || '',
          difficulty: s.exercise?.difficulty || 'Intermediate',
          estimatedTime: s.exercise?.estimatedTime || '',
          xp: s.exercise?.xp || 0,
          brief: s.exercise?.brief || '',
          overview: s.exercise?.overview || '',
          objectives: s.exercise?.objectives || {},
          steps: s.exercise?.steps || {},
          resources: [],
          status: s.status,
          prUrl: s.prUrl || null,
          lessonId: s.exercise?.lessonId || null,
        } as ExerciseDetailDto,
        prUrl: s.prUrl || '',
        status: s.status,
        submittedAt: s.submittedAt,
      })),
    };
  }

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
  @ApiResponse({ status: 201, type: SubmissionDetailDto, description: 'Nộp bài tập thành công.' })
  @Post('exercises/:id/submissions')
  async submit(
    @Param('id') exerciseId: string,
    @Body() dto: CreateSubmissionDto,
    @Req() req: RequestWithUser,
  ): Promise<SubmissionDetailDto> {
    const saved = await this.submissionsService.submit(exerciseId, req.user.id, dto.prUrl);
    const detailed = await this.submissionsService.findOne(saved.id, req.user.id, req.user.role);
    return this.mapToDetailDto(detailed);
  }

  @ApiOperation({ summary: 'Nộp lại bài tập sau khi chỉnh sửa' })
  @ApiResponse({ status: 200, type: SubmissionDetailDto, description: 'Nộp lại bài tập thành công.' })
  @Put('exercises/:id/submissions')
  async resubmit(
    @Param('id') exerciseId: string,
    @Body() dto: CreateSubmissionDto,
    @Req() req: RequestWithUser,
  ): Promise<SubmissionDetailDto> {
    const saved = await this.submissionsService.resubmit(exerciseId, req.user.id, dto.prUrl);
    const detailed = await this.submissionsService.findOne(saved.id, req.user.id, req.user.role);
    return this.mapToDetailDto(detailed);
  }

  @ApiOperation({ summary: 'Hàng chờ chấm điểm bài tập (Admin only)' })
  @ApiResponse({ status: 200, type: SubmissionListResponseDto, description: 'Lấy hàng chờ thành công.' })
  @Roles(UserRole.ADMIN)
  @Get('submissions')
  async findAll(@Query() query: SubmissionQueryDto): Promise<SubmissionListResponseDto> {
    const result = await this.submissionsService.findAll(query);
    return this.mapToListDto(result);
  }

  @ApiOperation({ summary: 'Lấy danh sách các bài nộp của learner hiện tại' })
  @ApiResponse({
    status: 200,
    type: SubmissionListResponseDto,
    description: 'Lấy danh sách bài nộp thành công.',
  })
  @Get('submissions/mine')
  async findMine(@Req() req: RequestWithUser): Promise<SubmissionListResponseDto> {
    const result = await this.submissionsService.findAll({ userId: req.user.id });
    return this.mapToListDto(result);
  }

  @ApiOperation({ summary: 'Lấy chi tiết một bài nộp' })
  @ApiResponse({ status: 200, type: SubmissionDetailDto, description: 'Lấy chi tiết bài nộp thành công.' })
  @Get('submissions/:id')
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser): Promise<SubmissionDetailDto> {
    const detailed = await this.submissionsService.findOne(id, req.user.id, req.user.role);
    return this.mapToDetailDto(detailed);
  }

  @ApiOperation({ summary: 'Đánh giá bài nộp (Admin only)' })
  @ApiResponse({ status: 200, type: SubmissionDetailDto, description: 'Đánh giá bài nộp thành công.' })
  @Roles(UserRole.ADMIN)
  @Post('submissions/:id/review')
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewSubmissionDto,
    @Req() req: RequestWithUser,
  ): Promise<SubmissionDetailDto> {
    const saved = await this.submissionsService.review(
      id,
      req.user.id,
      dto.status,
      dto.comment,
    );
    const detailed = await this.submissionsService.findOne(saved.id, req.user.id, req.user.role);
    return this.mapToDetailDto(detailed);
  }

  @ApiOperation({ summary: 'Phê duyệt bài tập (Admin only)' })
  @ApiResponse({ status: 200, type: SubmissionDetailDto, description: 'Phê duyệt bài nộp thành công.' })
  @Roles(UserRole.ADMIN)
  @Post('submissions/:id/approve')
  async approve(
    @Param('id') id: string,
    @Body() body: { comment?: string },
    @Req() req: RequestWithUser,
  ): Promise<SubmissionDetailDto> {
    const saved = await this.submissionsService.review(
      id,
      req.user.id,
      SubmissionStatus.APPROVED,
      body.comment,
    );
    const detailed = await this.submissionsService.findOne(saved.id, req.user.id, req.user.role);
    return this.mapToDetailDto(detailed);
  }

  @ApiOperation({ summary: 'Yêu cầu sửa đổi bài tập (Admin only)' })
  @ApiResponse({ status: 200, type: SubmissionDetailDto, description: 'Yêu cầu sửa đổi thành công.' })
  @Roles(UserRole.ADMIN)
  @Post('submissions/:id/request-changes')
  async requestChanges(
    @Param('id') id: string,
    @Body() body: { comment?: string },
    @Req() req: RequestWithUser,
  ): Promise<SubmissionDetailDto> {
    const saved = await this.submissionsService.review(
      id,
      req.user.id,
      SubmissionStatus.CHANGES,
      body.comment,
    );
    const detailed = await this.submissionsService.findOne(saved.id, req.user.id, req.user.role);
    return this.mapToDetailDto(detailed);
  }

  @ApiOperation({ summary: 'Lấy lịch sử chấm bài và nhận xét' })
  @ApiResponse({ status: 200, type: SubmissionHistoryResponseDto, description: 'Lấy lịch sử thành công.' })
  @Get('submissions/:id/history')
  async findHistory(@Param('id') id: string, @Req() req: RequestWithUser): Promise<SubmissionHistoryResponseDto> {
    const detailed = await this.submissionsService.findOne(id, req.user.id, req.user.role);
    const result = await this.submissionsService.findHistory(id, req.user.id, req.user.role);
    return {
      submissionId: id,
      exerciseId: detailed.exerciseId,
      history: result.data.map((h) => ({
        id: h.id,
        prUrl: detailed.prUrl,
        status: h.action === 'approved' ? SubmissionStatus.APPROVED : (h.action === 'request-changes' ? SubmissionStatus.CHANGES : SubmissionStatus.SUBMITTED),
        submittedAt: h.createdAt,
        reviewerId: h.adminId || null,
        reviewNote: h.comment || null,
        reviewedAt: h.createdAt,
      })),
    };
  }
}

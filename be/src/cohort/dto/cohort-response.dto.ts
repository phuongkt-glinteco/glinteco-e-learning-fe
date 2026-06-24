import { ApiProperty } from '@nestjs/swagger';

export class CohortDashboardStatsDto {
  @ApiProperty({ description: 'Số lượng học viên đang hoạt động', example: 10 })
  activeLearners: number;

  @ApiProperty({ description: 'Học viên mới trong tuần này', example: 2 })
  newThisWeek: number;

  @ApiProperty({ description: 'Tỷ lệ hoàn thành trung bình (phần trăm)', example: 45 })
  avgCompletion: number;

  @ApiProperty({ description: 'Độ lệch tỷ lệ hoàn thành trung bình so với tuần trước', example: 5 })
  avgCompletionDelta: number;

  @ApiProperty({ description: 'Số lượng bài tập đang chờ chấm', example: 3 })
  pendingReview: number;

  @ApiProperty({ description: 'Thời gian bài nộp chờ lâu nhất', example: '2d' })
  oldestPendingAgo: string;

  @ApiProperty({ description: 'Số ngày hoàn thành trung bình (ramp days)', example: 12 })
  avgRampDays: number;

  @ApiProperty({ description: 'Mục tiêu hoàn thành của Cohort (ramp days)', example: 14 })
  targetRampDays: number;
}

export class CohortTrackCompletionItemDto {
  @ApiProperty({ description: 'ID của Track', example: 'a5c78f9e-c852-4752-9d5b-4c5c2d3a3f5a' })
  trackId: string;

  @ApiProperty({ description: 'Tiêu đề Track', example: 'TypeScript Basics' })
  title: string;

  @ApiProperty({ description: 'Tỷ lệ hoàn thành track của Cohort', example: 80 })
  completionPct: number;
}

export class CohortTrackCompletionResponseDto {
  @ApiProperty({ type: [CohortTrackCompletionItemDto] })
  data: CohortTrackCompletionItemDto[];
}

export class CohortDetailDto {
  @ApiProperty({ description: 'ID của Cohort', example: 'b6c78f9e-c852-4752-9d5b-4c5c2d3a3f5b' })
  id: string;

  @ApiProperty({ description: 'Tên của Cohort', example: 'Cohort 2026' })
  name: string;

  @ApiProperty({ description: 'Mục tiêu số ngày hoàn thành', example: 14 })
  targetRampDays: number;

  @ApiProperty({ description: 'Thời gian khởi tạo Cohort' })
  createdAt: Date;
}

export class CohortSummaryDto {
  @ApiProperty({ description: 'ID của Cohort', example: 'b6c78f9e-c852-4752-9d5b-4c5c2d3a3f5b' })
  id: string;

  @ApiProperty({ description: 'Tên của Cohort', example: 'Cohort 2026' })
  name: string;

  @ApiProperty({ description: 'Số lượng học viên trong Cohort', example: 15 })
  learnerCount: number;

  @ApiProperty({ description: 'Tỷ lệ hoàn thành trung bình của Cohort', example: 65 })
  avgCompletion: number;
}

export class CohortMetaDto {
  @ApiProperty({ description: 'Tổng số' })
  total: number;

  @ApiProperty({ description: 'Trang hiện tại' })
  page: number;

  @ApiProperty({ description: 'Giới hạn số phần tử' })
  limit: number;

  @ApiProperty({ description: 'Trang cuối' })
  lastPage: number;
}

export class CohortListResponseDto {
  @ApiProperty({ type: [CohortSummaryDto] })
  data: CohortSummaryDto[];

  @ApiProperty()
  meta: CohortMetaDto;
}

import { ApiProperty } from '@nestjs/swagger';
import { TrackStatus } from '../../database/entities/track.entity';

export class AdminTrackItemDto {
  @ApiProperty({ example: 'd3b07384-d113-495f-9f75-e11500e3cfd0' })
  id: string;

  @ApiProperty({ example: 'Frontend Bootcamp' })
  title: string;

  @ApiProperty({ example: 1 })
  order: number;

  @ApiProperty({ enum: TrackStatus, example: TrackStatus.ACTIVE })
  status: TrackStatus;

  @ApiProperty({ example: 'Beginner' })
  level: string;

  @ApiProperty({ example: '12h' })
  estimatedTime: string;

  @ApiProperty({ example: 20, description: 'Tổng số bài học trong track' })
  totalLessons: number;

  @ApiProperty({ example: 45, description: 'Số học viên đang tham gia track' })
  enrolledCount: number;

  @ApiProperty({ example: 12, description: 'Số học viên đã hoàn thành track' })
  completedCount: number;

  @ApiProperty({
    example: 68,
    description: 'Tỷ lệ hoàn thành trung bình của học viên (%)',
  })
  avgCompletion: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AdminTrackListResponseDto {
  @ApiProperty({ type: [AdminTrackItemDto] })
  data: AdminTrackItemDto[];
}

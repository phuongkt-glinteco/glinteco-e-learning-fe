import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CohortUsersProgressQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên hoặc email học viên' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo một track cụ thể' })
  @IsOptional()
  @IsUUID('4', { message: 'trackId phải là một UUID hợp lệ' })
  trackId?: string;
}

export class CohortUserTrackProgressDto {
  @ApiProperty({ example: 'd3b07384-d113-495f-9f75-e11500e3cfd0' })
  trackId: string;

  @ApiProperty({ example: 'Frontend Bootcamp' })
  title: string;

  @ApiProperty({ example: 75, description: 'Tỷ lệ hoàn thành track (%)' })
  progressPct: number;

  @ApiProperty({ example: 15 })
  completedLessons: number;

  @ApiProperty({ example: 20 })
  totalLessons: number;

  @ApiProperty({
    example: 'in_progress',
    enum: ['not_started', 'in_progress', 'completed'],
  })
  status: 'not_started' | 'in_progress' | 'completed';
}

export class CohortUserProgressItemDto {
  @ApiProperty({ example: 'usr-uuid' })
  userId: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  name: string;

  @ApiProperty({ example: 'a.nguyen@example.com' })
  email: string;

  @ApiProperty({ example: 120, nullable: true })
  avatarHue: number | null;

  @ApiProperty({ example: 2 })
  level: number;

  @ApiProperty({ example: 1240 })
  xp: number;

  @ApiProperty({ type: [CohortUserTrackProgressDto] })
  tracks: CohortUserTrackProgressDto[];
}

export class CohortUsersProgressResponseDto {
  @ApiProperty({ example: 'coh-uuid' })
  cohortId: string;

  @ApiProperty({ example: 45, description: 'Tổng số học viên khớp bộ lọc' })
  totalUsers: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ type: [CohortUserProgressItemDto] })
  data: CohortUserProgressItemDto[];
}

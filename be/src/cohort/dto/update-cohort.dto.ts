import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateCohortDto {
  @ApiPropertyOptional({
    description: 'Tên của khóa học viên (Cohort).',
    example: 'Summer 2026 - Revised',
  })
  @IsOptional()
  @IsString({ message: 'Tên cohort phải là một chuỗi ký tự' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Số ngày mục tiêu để hoàn thành lộ trình onboarding.',
    example: 15,
  })
  @IsOptional()
  @IsInt({ message: 'Số ngày mục tiêu phải là số nguyên' })
  @IsPositive({ message: 'Số ngày mục tiêu phải lớn hơn 0' })
  targetRampDays?: number;

  @ApiPropertyOptional({
    description: 'Trạng thái hoạt động của Cohort.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hoạt động phải là kiểu boolean' })
  isActive?: boolean;
}

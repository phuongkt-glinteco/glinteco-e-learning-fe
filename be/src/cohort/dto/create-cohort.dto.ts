import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateCohortDto {
  @ApiProperty({
    description: 'Tên của khóa học viên (Cohort).',
    example: 'Summer 2026',
  })
  @IsNotEmpty({ message: 'Tên cohort không được để trống' })
  @IsString({ message: 'Tên cohort phải là một chuỗi ký tự' })
  name: string;

  @ApiProperty({
    description: 'Số ngày mục tiêu để hoàn thành lộ trình onboarding.',
    example: 14,
  })
  @IsNotEmpty({ message: 'Số ngày mục tiêu không được để trống' })
  @IsInt({ message: 'Số ngày mục tiêu phải là số nguyên' })
  @IsPositive({ message: 'Số ngày mục tiêu phải lớn hơn 0' })
  targetRampDays: number;
}

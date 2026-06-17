import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubmissionStatus } from '../../database/entities/submission.entity';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SubmissionQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc danh sách bài nộp theo trạng thái.',
    enum: SubmissionStatus,
    example: SubmissionStatus.SUBMITTED,
  })
  @IsOptional()
  @IsEnum(SubmissionStatus, {
    message: 'Trạng thái bài nộp không hợp lệ',
  })
  status?: SubmissionStatus;

  @ApiPropertyOptional({
    description: 'Lọc theo ID của khóa/lớp học (Cohort).',
    example: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @IsOptional()
  @IsUUID('4', { message: 'cohortId phải là định dạng UUID' })
  cohortId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID của học viên.',
    example: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @IsOptional()
  @IsUUID('4', { message: 'userId phải là định dạng UUID' })
  userId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo ID của bài tập thực hành.',
    example: '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
  })
  @IsOptional()
  @IsUUID('4', { message: 'exerciseId phải là định dạng UUID' })
  exerciseId?: string;

  @ApiPropertyOptional({
    description: 'Trang cần lấy dữ liệu.',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Trang (page) phải là số nguyên' })
  @Min(1, { message: 'Trang tối thiểu là 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng bài nộp trên mỗi trang.',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Giới hạn (limit) phải là số nguyên' })
  @Min(1, { message: 'Giới hạn tối thiểu là 1' })
  @Max(100, { message: 'Giới hạn tối đa là 100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Trường sắp xếp kết quả.',
    default: 'submittedAt',
  })
  @IsOptional()
  @IsString({ message: 'Trường sắp xếp phải là chuỗi' })
  sortBy?: string = 'submittedAt';

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp kết quả (tăng dần hoặc giảm dần).',
    enum: SortOrder,
    default: SortOrder.ASC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'Thứ tự sắp xếp không hợp lệ (ASC hoặc DESC)' })
  sortOrder?: SortOrder = SortOrder.ASC;
}

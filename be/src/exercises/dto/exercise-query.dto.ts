import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ExerciseDifficulty } from '../../database/entities/exercise.entity';

export enum ExerciseFilterStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  CHANGES = 'changes',
}

export class ExerciseQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc bài tập thuộc Track cụ thể.',
    example: 't3',
  })
  @IsOptional()
  @IsString({ message: 'trackId phải là một chuỗi ký tự' })
  trackId?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo nhãn chuyên môn.',
    example: 'NestJS',
  })
  @IsOptional()
  @IsString({ message: 'tag phải là một chuỗi ký tự' })
  tag?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo cấp độ khó.',
    enum: ExerciseDifficulty,
    example: ExerciseDifficulty.INTERMEDIATE,
  })
  @IsOptional()
  @IsEnum(ExerciseDifficulty, {
    message:
      'Độ khó phải là một trong các giá trị: Beginner, Intermediate, Advanced',
  })
  difficulty?: ExerciseDifficulty;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái bài nộp cá nhân của Learner.',
    enum: ExerciseFilterStatus,
    example: ExerciseFilterStatus.SUBMITTED,
  })
  @IsOptional()
  @IsEnum(ExerciseFilterStatus, {
    message:
      'Trạng thái lọc phải là một trong các giá trị: pending, submitted, approved, changes',
  })
  status?: ExerciseFilterStatus;

  @ApiPropertyOptional({
    description:
      'Số lượng phần tử tối đa trả về trên mỗi trang (phục vụ cursor pagination).',
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit phải lớn hơn hoặc bằng 1' })
  @Max(100, { message: 'limit tối đa là 100' })
  limit?: number = 20;

  @ApiPropertyOptional({
    description:
      'Cursor dùng để tải trang tiếp theo (phục vụ keyset pagination).',
    example: 'eyJjcmVhdGVkQXQiOiIyMDI2LTA2LTE2VDE1OjE2OjU2WiIsImlkIjoiZSJ9',
  })
  @IsOptional()
  @IsString({ message: 'cursor phải là một chuỗi ký tự' })
  cursor?: string;
}

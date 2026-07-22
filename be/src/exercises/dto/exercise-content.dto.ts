import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsEnum,
  IsInt,
  Min,
  Max,
  ValidateNested,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum QuizMode {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}

export enum GradingPolicy {
  ALL_OR_NOTHING = 'ALL_OR_NOTHING',
  PARTIAL_CREDIT = 'PARTIAL_CREDIT',
}

export class PrReviewExerciseContentDto {
  @ApiProperty({ description: 'Mô tả tổng quan bài tập PR Review' })
  @IsString()
  @IsNotEmpty()
  overview: string;

  @ApiProperty({ type: [String], description: 'Các mục tiêu nghiệm thu' })
  @IsArray()
  @IsString({ each: true })
  objectives: string[];

  @ApiProperty({ type: [String], description: 'Các bước thực hiện' })
  @IsArray()
  @IsString({ each: true })
  steps: string[];
}

export class QuizQuestionItemDto {
  @ApiProperty({ description: 'ID câu hỏi' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Nội dung câu hỏi' })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({ type: [String], description: 'Danh sách đáp án lựa chọn' })
  @IsArray()
  @IsString({ each: true })
  options: string[];

  @ApiPropertyOptional({
    description: 'Đáp án đúng (Bị ẩn khi GET trả về cho học viên)',
  })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Danh sách đáp án đúng cho MULTIPLE_CHOICE (Bị ẩn khi GET trả về cho học viên)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  correctAnswers?: string[];
}

export class QuizExerciseContentDto {
  @ApiProperty({ enum: QuizMode, default: QuizMode.SINGLE_CHOICE })
  @IsEnum(QuizMode)
  quizMode: QuizMode;

  @ApiProperty({ enum: GradingPolicy, default: GradingPolicy.ALL_OR_NOTHING })
  @IsEnum(GradingPolicy)
  gradingPolicy: GradingPolicy;

  @ApiPropertyOptional({ description: 'Điểm tối thiểu (%) để qua', default: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  targetScore?: number;

  @ApiProperty({ type: [QuizQuestionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionItemDto)
  questions: QuizQuestionItemDto[];
}

export class FillBlankItemDto {
  @ApiProperty({ description: 'Vị trí blank trong chuỗi câu hỏi (ví dụ 0, 1)' })
  @IsInt()
  position: number;

  @ApiProperty({ description: 'Độ dài ký tự của đáp án' })
  @IsInt()
  @Min(1)
  length: number;

  @ApiPropertyOptional({ description: 'Chuỗi đáp án đúng (Bị ẩn khi GET trả về cho học viên)' })
  @IsOptional()
  @IsString()
  correctAnswer?: string;
}

export class FillInBlankExerciseContentDto {
  @ApiProperty({
    description: 'Chuỗi câu hỏi chứa các placeholder như {0}, {1} hoặc ___',
  })
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @ApiProperty({ type: [FillBlankItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FillBlankItemDto)
  blanks: FillBlankItemDto[];

  @ApiPropertyOptional({ description: 'Điểm tối thiểu (%) để qua', default: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  targetScore?: number;
}

export type ExerciseContentDto =
  | PrReviewExerciseContentDto
  | QuizExerciseContentDto
  | FillInBlankExerciseContentDto
  | Record<string, any>;

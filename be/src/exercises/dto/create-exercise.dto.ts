import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  Min,
} from 'class-validator';
import { ExerciseDifficulty } from '../../database/entities/exercise.entity';

export class CreateExerciseDto {
  @ApiProperty({
    description: 'Tiêu đề bài tập thực hành.',
    example: 'Service Auth Middleware',
  })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString({ message: 'Tiêu đề phải là một chuỗi ký tự' })
  title: string;

  @ApiProperty({
    description: 'ID của Track (UUID) chứa bài tập này.',
    example: 'd3b07384-d113-495f-9f75-e11500e3cfd0',
  })
  @IsNotEmpty({ message: 'trackId không được để trống' })
  @IsUUID('4', { message: 'trackId phải là một UUID hợp lệ' })
  trackId: string;

  @ApiProperty({
    description: 'Nhãn phân loại chuyên môn.',
    example: 'NestJS',
  })
  @IsNotEmpty({ message: 'Tag chuyên môn không được để trống' })
  @IsString({ message: 'Tag phải là một chuỗi ký tự' })
  tag: string;

  @ApiProperty({
    description: 'Cấp độ khó của bài tập.',
    enum: ExerciseDifficulty,
    example: ExerciseDifficulty.INTERMEDIATE,
  })
  @IsNotEmpty({ message: 'Độ khó không được để trống' })
  @IsEnum(ExerciseDifficulty, {
    message:
      'Độ khó phải là một trong các giá trị: Beginner, Intermediate, Advanced',
  })
  difficulty: ExerciseDifficulty;

  @ApiProperty({
    description: 'Thời gian ước tính hoàn thành bài tập.',
    example: '2h',
  })
  @IsNotEmpty({ message: 'Thời gian ước tính không được để trống' })
  @IsString({ message: 'Thời gian ước tính phải là một chuỗi ký tự' })
  estimatedTime: string;

  @ApiProperty({
    description: 'Điểm kinh nghiệm nhận được sau khi hoàn thành bài tập.',
    example: 180,
  })
  @IsNotEmpty({ message: 'XP không được để trống' })
  @IsInt({ message: 'XP phải là số nguyên' })
  @Min(0, { message: 'XP không được nhỏ hơn 0' })
  xp: number;

  @ApiProperty({
    description: 'Mô tả ngắn gọn về yêu cầu bài tập.',
    example: 'Add a JWT guard that attaches the user to the request.',
  })
  @IsNotEmpty({ message: 'Brief không được để trống' })
  @IsString({ message: 'Brief phải là một chuỗi ký tự' })
  brief: string;

  @ApiProperty({
    description: 'Tổng quan chi tiết về bối cảnh và hướng đi.',
    example: 'Every protected route runs through this guard...',
  })
  @IsNotEmpty({ message: 'Overview không được để trống' })
  @IsString({ message: 'Overview phải là một chuỗi ký tự' })
  overview: string;

  @ApiProperty({
    description: 'Danh sách tiêu chí nghiệm thu (Acceptance Criteria).',
    type: [String],
    example: [
      'Verify JWT signature',
      'Attach user to request',
      '401 on invalid token',
    ],
  })
  @IsNotEmpty({ message: 'Objectives không được để trống' })
  @IsArray({ message: 'Objectives phải là một mảng chuỗi' })
  @IsString({ each: true, message: 'Mỗi objective phải là một chuỗi ký tự' })
  objectives: string[];

  @ApiProperty({
    description: 'Các bước gợi ý để thực hiện bài tập.',
    type: [String],
    example: ['Create the guard', 'Register it globally', 'Write the spec'],
  })
  @IsNotEmpty({ message: 'Steps không được để trống' })
  @IsArray({ message: 'Steps phải là một mảng chuỗi' })
  @IsString({ each: true, message: 'Mỗi step phải là một chuỗi ký tự' })
  steps: string[];

  @ApiProperty({
    description: 'Danh sách ID tài liệu tham khảo (Document UUIDs).',
    type: [String],
    required: false,
    example: ['d5'],
  })
  @IsOptional()
  @IsArray({ message: 'resourceDocIds phải là một mảng' })
  @IsUUID('4', {
    each: true,
    message: 'Mỗi resourceDocId phải là một UUID hợp lệ',
  })
  resourceDocIds?: string[];

  @ApiProperty({
    description: 'Gợi ý hoặc lưu ý đặc biệt cho bài tập.',
    required: false,
    example: 'Reuse the shared JwtService config.',
  })
  @IsOptional()
  @IsString({ message: 'Hint phải là một chuỗi ký tự' })
  hint?: string;
}

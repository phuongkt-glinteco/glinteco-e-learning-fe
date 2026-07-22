import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  Min,
  Max,
  ValidateNested,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ExerciseDifficulty,
  ExerciseType,
} from '../../database/entities/exercise.entity';

export class ExerciseQuestionDto {
  @ApiProperty({ description: 'ID câu hỏi (duy nhất trong bài tập)' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'Nội dung câu hỏi' })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiPropertyOptional({
    description: 'Các lựa chọn (bắt buộc với QUIZ)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiProperty({
    description:
      'Đáp án đúng. KHÔNG bao giờ trả về cho học viên (bị strip khi GET).',
  })
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;
}

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

  @ApiPropertyOptional({
    description: 'ID của Lesson (UUID) chứa bài tập này (nếu có).',
    example: 'd3b07384-d113-495f-9f75-e11500e3cfd0',
  })
  @IsOptional()
  @IsUUID('4', { message: 'lessonId phải là một UUID hợp lệ' })
  lessonId?: string;

  @ApiPropertyOptional({
    description: 'ID của thực thể Tag (foreign key tới tags table).',
    example: 'd3b07384-d113-495f-9f75-e11500e3cfd0',
  })
  @IsOptional()
  @IsUUID('4', { message: 'tagId phải là một UUID hợp lệ' })
  tagId?: string;

  @ApiPropertyOptional({
    description: 'Nhãn phân loại chuyên môn (hoặc fallback tên tag).',
    example: 'NestJS',
  })
  @IsOptional()
  @IsString({ message: 'Tag phải là một chuỗi ký tự' })
  tag?: string;

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

  @ApiPropertyOptional({
    description: 'Nội dung chi tiết theo dạng bài tập (content).',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  content?: Record<string, any>;

  // Legacy compatibility fields
  @ApiPropertyOptional({
    description: 'Tổng quan chi tiết về bối cảnh và hướng đi.',
    example: 'Every protected route runs through this guard...',
  })
  @IsOptional()
  @IsString()
  overview?: string;

  @ApiPropertyOptional({
    description: 'Danh sách tiêu chí nghiệm thu (Acceptance Criteria).',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  objectives?: string[];

  @ApiPropertyOptional({
    description: 'Các bước gợi ý để thực hiện bài tập.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  steps?: string[];

  @ApiPropertyOptional({
    description: 'Danh sách ID tài liệu tham khảo (Document UUIDs).',
    type: [String],
    example: ['d5'],
  })
  @IsOptional()
  @IsArray({ message: 'resourceDocIds phải là một mảng' })
  @IsUUID('4', {
    each: true,
    message: 'Mỗi resourceDocId phải là một UUID hợp lệ',
  })
  resourceDocIds?: string[];

  @ApiPropertyOptional({
    description: 'Gợi ý hoặc lưu ý đặc biệt cho bài tập.',
    example: 'Reuse the shared JwtService config.',
  })
  @IsOptional()
  @IsString({ message: 'Hint phải là một chuỗi ký tự' })
  hint?: string;

  @ApiPropertyOptional({
    description: 'Thể loại bài tập. Mặc định: PR_REVIEW.',
    enum: ExerciseType,
    example: ExerciseType.QUIZ,
  })
  @IsOptional()
  @IsEnum(ExerciseType, {
    message: 'type phải là một trong: PR_REVIEW, QUIZ, FILL_IN_BLANK',
  })
  type?: ExerciseType;

  @ApiPropertyOptional({
    description:
      'Cấu trúc câu hỏi + đáp án cho QUIZ/FILL_IN_BLANK (legacy). Chỉ Admin thấy correctAnswer.',
    type: [ExerciseQuestionDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseQuestionDto)
  questionsData?: ExerciseQuestionDto[];

  @ApiPropertyOptional({
    description: 'Điểm (%) tối thiểu để đạt khi tự động chấm. Mặc định: 100.',
    example: 80,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  targetScore?: number;

  @ApiPropertyOptional({
    description: 'Bài tập bắt buộc để hoàn thành bài học. Mặc định: true.',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;
}

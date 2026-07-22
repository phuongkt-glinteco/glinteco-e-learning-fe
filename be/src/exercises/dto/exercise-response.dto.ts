import { ApiProperty, ApiPropertyOptional, ApiExtraModels } from '@nestjs/swagger';
import {
  ExerciseDifficulty,
  ExerciseType,
} from '../../database/entities/exercise.entity';
import { DocumentResponseDto, TagResponseDto } from '../../documents/dto/document-response.dto';
import { ExerciseFilterStatus } from './exercise-query.dto';
import {
  PrReviewExerciseContentDto,
  QuizExerciseContentDto,
  FillInBlankExerciseContentDto,
} from './exercise-content.dto';

export class ExerciseSummaryDto {
  @ApiProperty({ description: 'ID của bài tập' })
  id: string;

  @ApiProperty({ description: 'Tiêu đề bài tập' })
  title: string;

  @ApiProperty({ description: 'ID của Track chứa bài tập' })
  trackId: string;

  @ApiProperty({ description: 'Tiêu đề Track chứa bài tập' })
  track: string;

  @ApiProperty({ description: 'Nhãn chuyên môn (Tên tag)' })
  tag: string;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'ID của thực thể Tag' })
  tagId?: string | null;

  @ApiProperty({ enum: ExerciseDifficulty, description: 'Cấp độ khó' })
  difficulty: ExerciseDifficulty;

  @ApiProperty({ description: 'Thời gian ước tính hoàn thành' })
  estimatedTime: string;

  @ApiProperty({ description: 'Số điểm XP thưởng khi hoàn thành' })
  xp: number;

  @ApiProperty({ description: 'Tóm tắt yêu cầu bài tập' })
  brief: string;

  @ApiProperty({ description: 'Số lượng mục tiêu cần hoàn thành' })
  objectiveCount: number;

  @ApiProperty({
    enum: ExerciseFilterStatus,
    description: 'Trạng thái bài nộp cá nhân của user',
  })
  status: ExerciseFilterStatus;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Đường dẫn PR nộp bài tập',
  })
  prUrl: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'ID của bài học liên kết với bài tập (nếu có)',
  })
  lessonId: string | null;

  @ApiProperty({ enum: ExerciseType })
  type: ExerciseType;

  @ApiProperty()
  isMandatory: boolean;

  @ApiProperty({ description: 'Bài tập chỉ có thể xem, không thể thao tác.' })
  isReadOnly: boolean;
}

export class ExerciseListResponseDto {
  @ApiProperty({ type: [ExerciseSummaryDto] })
  data: ExerciseSummaryDto[];
}

export class ExerciseQuestionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  prompt: string;

  @ApiPropertyOptional({ type: [String] })
  options?: string[];
}

@ApiExtraModels(
  PrReviewExerciseContentDto,
  QuizExerciseContentDto,
  FillInBlankExerciseContentDto,
)
export class ExerciseDetailDto {
  @ApiProperty({ description: 'ID của bài tập' })
  id: string;

  @ApiProperty({ description: 'Tiêu đề bài tập' })
  title: string;

  @ApiProperty({ description: 'ID của Track chứa bài tập' })
  trackId: string;

  @ApiProperty({ description: 'Tiêu đề Track chứa bài tập' })
  track: string;

  @ApiProperty({ description: 'Nhãn chuyên môn (Tên tag)' })
  tag: string;

  @ApiPropertyOptional({ type: String, nullable: true, description: 'ID của thực thể Tag' })
  tagId?: string | null;

  @ApiPropertyOptional({ type: () => TagResponseDto, nullable: true, description: 'Dữ liệu thẻ phân loại' })
  tagData?: TagResponseDto | null;

  @ApiProperty({ enum: ExerciseDifficulty, description: 'Cấp độ khó' })
  difficulty: ExerciseDifficulty;

  @ApiProperty({ description: 'Thời gian ước tính hoàn thành' })
  estimatedTime: string;

  @ApiProperty({ description: 'Số điểm XP thưởng khi hoàn thành' })
  xp: number;

  @ApiProperty({ description: 'Tóm tắt yêu cầu bài tập' })
  brief: string;

  @ApiPropertyOptional({
    description: 'Nội dung riêng theo từng loại (PR_REVIEW, QUIZ, FILL_IN_BLANK)',
    type: Object,
  })
  content?: Record<string, any>;

  // Legacy fields derived from content for backward compatibility
  @ApiPropertyOptional({ description: 'Mô tả tổng quan chi tiết bài tập' })
  overview?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Các mục tiêu cần đạt được',
  })
  objectives?: any;

  @ApiPropertyOptional({
    type: [String],
    description: 'Các bước hướng dẫn thực hiện',
  })
  steps?: any;

  @ApiProperty({
    type: [DocumentResponseDto],
    description: 'Tài liệu hướng dẫn liên kết',
  })
  resources: DocumentResponseDto[];

  @ApiProperty({ nullable: true, description: 'Gợi ý giải bài tập' })
  hint?: string;

  @ApiProperty({
    enum: ExerciseFilterStatus,
    description: 'Trạng thái bài nộp cá nhân của user',
  })
  status: ExerciseFilterStatus;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'Đường dẫn PR nộp bài tập',
  })
  prUrl: string | null;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'ID của bài học liên kết với bài tập (nếu có)',
  })
  lessonId: string | null;

  @ApiProperty({ enum: ExerciseType })
  type: ExerciseType;

  @ApiPropertyOptional({ type: [ExerciseQuestionResponseDto], nullable: true })
  questionsData?: ExerciseQuestionResponseDto[] | null;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  targetScore?: number;

  @ApiProperty()
  isMandatory: boolean;

  @ApiProperty({ description: 'Bài tập chỉ có thể xem, không thể thao tác.', default: false })
  isReadOnly: boolean;
}

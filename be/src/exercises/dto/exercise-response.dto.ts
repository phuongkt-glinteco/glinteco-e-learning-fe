import { ApiProperty } from '@nestjs/swagger';
import { ExerciseDifficulty } from '../../database/entities/exercise.entity';
import { DocumentResponseDto } from '../../documents/dto/document-response.dto';
import { ExerciseFilterStatus } from './exercise-query.dto';

export class ExerciseSummaryDto {
  @ApiProperty({ description: 'ID của bài tập' })
  id: string;

  @ApiProperty({ description: 'Tiêu đề bài tập' })
  title: string;

  @ApiProperty({ description: 'ID của Track chứa bài tập' })
  trackId: string;

  @ApiProperty({ description: 'Tiêu đề Track chứa bài tập' })
  track: string;

  @ApiProperty({ description: 'Nhãn chuyên môn' })
  tag: string;

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
    nullable: true,
    description: 'Đường dẫn PR nộp bài tập',
  })
  prUrl: string | null;

  @ApiProperty({
    nullable: true,
    description: 'ID của bài học liên kết với bài tập (nếu có)',
  })
  lessonId: string | null;
}

export class ExerciseListResponseDto {
  @ApiProperty({ type: [ExerciseSummaryDto] })
  data: ExerciseSummaryDto[];
}

export class ExerciseDetailDto {
  @ApiProperty({ description: 'ID của bài tập' })
  id: string;

  @ApiProperty({ description: 'Tiêu đề bài tập' })
  title: string;

  @ApiProperty({ description: 'ID của Track chứa bài tập' })
  trackId: string;

  @ApiProperty({ description: 'Tiêu đề Track chứa bài tập' })
  track: string;

  @ApiProperty({ description: 'Nhãn chuyên môn' })
  tag: string;

  @ApiProperty({ enum: ExerciseDifficulty, description: 'Cấp độ khó' })
  difficulty: ExerciseDifficulty;

  @ApiProperty({ description: 'Thời gian ước tính hoàn thành' })
  estimatedTime: string;

  @ApiProperty({ description: 'Số điểm XP thưởng khi hoàn thành' })
  xp: number;

  @ApiProperty({ description: 'Tóm tắt yêu cầu bài tập' })
  brief: string;

  @ApiProperty({ description: 'Mô tả tổng quan chi tiết bài tập' })
  overview: string;

  @ApiProperty({ type: 'object', additionalProperties: true, description: 'Các mục tiêu cần đạt được' })
  objectives: Record<string, any>;

  @ApiProperty({ type: 'object', additionalProperties: true, description: 'Các bước hướng dẫn thực hiện' })
  steps: Record<string, any>;

  @ApiProperty({ type: [DocumentResponseDto], description: 'Tài liệu hướng dẫn liên kết' })
  resources: DocumentResponseDto[];

  @ApiProperty({ nullable: true, description: 'Gợi ý giải bài tập' })
  hint?: string;

  @ApiProperty({
    enum: ExerciseFilterStatus,
    description: 'Trạng thái bài nộp cá nhân của user',
  })
  status: ExerciseFilterStatus;

  @ApiProperty({
    nullable: true,
    description: 'Đường dẫn PR nộp bài tập',
  })
  prUrl: string | null;

  @ApiProperty({
    nullable: true,
    description: 'ID của bài học liên kết với bài tập (nếu có)',
  })
  lessonId: string | null;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseDetailDto } from '../../exercises/dto/exercise-response.dto';
import { SubmissionStatus } from '../../database/entities/submission.entity';

export class SubmissionUserDto {
  @ApiProperty({ description: 'ID của người dùng', example: 'u1' })
  id: string;

  @ApiProperty({ description: 'Họ tên của người dùng', example: 'John Doe' })
  name: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Màu đại diện avatar',
    example: 120,
  })
  avatarHue?: number;
}

export class SubmissionFeedItemDto {
  @ApiProperty({ description: 'ID của bài nộp', example: 's1' })
  id: string;

  @ApiProperty({ type: SubmissionUserDto })
  user: SubmissionUserDto;

  @ApiProperty({ type: ExerciseDetailDto })
  exercise: ExerciseDetailDto;

  @ApiProperty({
    description: 'Đường dẫn Pull Request',
    example: 'https://github.com/org/repo/pull/1',
  })
  prUrl: string;

  @ApiProperty({ enum: SubmissionStatus, description: 'Trạng thái bài nộp' })
  status: SubmissionStatus;

  @ApiProperty({ description: 'Thời gian nộp bài' })
  submittedAt: Date;
}

export class SubmissionListResponseDto {
  @ApiProperty({ type: [SubmissionFeedItemDto] })
  data: SubmissionFeedItemDto[];

  @ApiProperty({
    description: 'Con trỏ trang tiếp theo',
    nullable: true,
    example: 'eyJzdWJtaXR0ZWRBdCI6... ',
  })
  nextCursor: string | null;

  @ApiProperty({
    description: 'Còn dữ liệu trang kế tiếp không',
    example: true,
  })
  hasMore: boolean;
}

export class SubmissionDetailUserDto {
  @ApiProperty({ description: 'ID của người dùng', example: 'u1' })
  id: string;

  @ApiProperty({ description: 'Họ tên của người dùng', example: 'John Doe' })
  name: string;
}

export class SubmissionDetailDto {
  @ApiProperty({ description: 'ID của bài nộp', example: 's1' })
  id: string;

  @ApiProperty({ description: 'ID của bài tập', example: 'e2' })
  exerciseId: string;

  @ApiProperty({ description: 'Tiêu đề bài tập', example: 'TypeScript Basics' })
  exercise: string;

  @ApiProperty({ type: SubmissionDetailUserDto })
  user: SubmissionDetailUserDto;

  @ApiProperty({
    description: 'Đường dẫn Pull Request',
    example: 'https://github.com/org/repo/pull/1',
  })
  prUrl: string;

  @ApiProperty({ enum: SubmissionStatus, description: 'Trạng thái bài nộp' })
  status: SubmissionStatus;

  @ApiProperty({
    description: 'ID của người chấm bài',
    nullable: true,
    example: 'a1',
  })
  reviewerId: string | null;

  @ApiProperty({
    description: 'Nhận xét của người chấm bài',
    nullable: true,
    example: 'Tốt lắm',
  })
  reviewNote: string | null;

  @ApiProperty({ description: 'Thời gian nộp bài' })
  submittedAt: Date;

  @ApiProperty({ description: 'Thời gian chấm bài', nullable: true })
  reviewedAt: Date | null;
}

export class SubmissionHistoryItemDto {
  @ApiProperty({ description: 'ID của bản ghi lịch sử', example: 'sh1' })
  id: string;

  @ApiProperty({
    description: 'Đường dẫn Pull Request tại thời điểm nộp',
    example: 'https://github.com/org/repo/pull/1',
  })
  prUrl: string;

  @ApiProperty({
    enum: SubmissionStatus,
    description: 'Trạng thái bài nộp sau hoạt động',
  })
  status: SubmissionStatus;

  @ApiProperty({ description: 'Thời gian thực hiện hoạt động' })
  submittedAt: Date;

  @ApiProperty({
    description: 'ID của admin thực hiện hoạt động',
    nullable: true,
    example: 'a1',
  })
  reviewerId: string | null;

  @ApiProperty({
    description: 'Ghi chú đánh giá của admin',
    nullable: true,
    example: 'Cần sửa đổi...',
  })
  reviewNote: string | null;

  @ApiProperty({ description: 'Thời gian đánh giá', nullable: true })
  reviewedAt: Date | null;
}

export class SubmissionHistoryResponseDto {
  @ApiProperty({ description: 'ID của bài nộp chính', example: 's1' })
  submissionId: string;

  @ApiProperty({ description: 'ID của bài tập', example: 'e2' })
  exerciseId: string;

  @ApiProperty({ type: [SubmissionHistoryItemDto] })
  history: SubmissionHistoryItemDto[];
}

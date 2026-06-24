import { ApiProperty } from '@nestjs/swagger';
import { LessonType } from '../../database/entities/lesson.entity';
import { DocumentResponseDto } from '../../documents/dto/document-response.dto';

export enum TrackStatus {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  LOCKED = 'locked',
}

export enum TrackAccessStatus {
  UNLOCKED = 'unlocked',
  LOCKED = 'locked',
}

export class LessonSummaryDto {
  @ApiProperty({ description: 'ID của bài học' })
  id: string;

  @ApiProperty({ description: 'Tiêu đề bài học' })
  title: string;

  @ApiProperty({ description: 'Số thứ tự bài học trong track' })
  order: number;

  @ApiProperty({ description: 'Thời gian ước tính hoàn thành' })
  estimatedTime: string;

  @ApiProperty({ enum: LessonType, description: 'Phân loại bài học' })
  type: LessonType;

  @ApiProperty({ type: String, description: 'Mô tả ngắn của bài học', nullable: true })
  description: string | null;
}

export class LessonProgressItemDto {
  @ApiProperty({ description: 'ID của bài học' })
  id: string;

  @ApiProperty({ description: 'Tiêu đề bài học' })
  title: string;

  @ApiProperty({ description: 'Số thứ tự bài học trong track' })
  order: number;

  @ApiProperty({ description: 'Trạng thái hoàn thành bài học' })
  completed: boolean;

  @ApiProperty({ enum: LessonType, description: 'Phân loại bài học' })
  type: LessonType;

  @ApiProperty({ type: String, description: 'Mô tả ngắn của bài học', nullable: true })
  description: string | null;
}

export class LessonDetailDto {
  @ApiProperty({ description: 'ID của bài học' })
  id: string;

  @ApiProperty({ description: 'ID của track chứa bài học' })
  trackId: string;

  @ApiProperty({ description: 'Tiêu đề bài học' })
  title: string;

  @ApiProperty({ description: 'Số thứ tự bài học trong track' })
  order: number;

  @ApiProperty({ description: 'Thời gian ước tính hoàn thành' })
  estimatedTime: string;

  @ApiProperty({ description: 'Nội dung chi tiết bài học (Markdown)' })
  body: string;

  @ApiProperty({ type: String, description: 'Mô tả ngắn của bài học', nullable: true })
  description: string | null;

  @ApiProperty({ enum: LessonType, description: 'Phân loại bài học' })
  type: LessonType;

  @ApiProperty({ description: 'Trạng thái hoàn thành bài học của user' })
  completed: boolean;

  @ApiProperty({ type: [DocumentResponseDto], description: 'Danh sách tài liệu liên quan đến bài học' })
  relatedDocs: DocumentResponseDto[];
}

export class TrackSummaryDto {
  @ApiProperty({ description: 'ID của Track' })
  id: string;

  @ApiProperty({ description: 'Tiêu đề Track' })
  title: string;

  @ApiProperty({ description: 'Thời gian ước tính hoàn thành track' })
  estimatedTime: string;

  @ApiProperty({ description: 'Thứ tự sắp xếp của track' })
  order: number;

  @ApiProperty({ description: 'Tổng số bài học trong track' })
  lessonCount: number;

  @ApiProperty({ description: 'Icon hiển thị của track' })
  icon: string;

  @ApiProperty({
    enum: TrackStatus,
    description: 'Trạng thái học tập của track đối với user',
  })
  status: TrackStatus;

  @ApiProperty({ description: 'Số lượng bài học đã hoàn thành trong track' })
  lessonsCompleted: number;

  @ApiProperty({ description: 'Mô tả chi tiết nội dung track' })
  description: string;

  @ApiProperty({
    description: 'Cấp độ khó của Track/Course',
    example: 'Beginner',
  })
  level: string;

  @ApiProperty({
    description: 'Đường dẫn ảnh thumbnail của Track',
    nullable: true,
  })
  thumbnail: string | null;

  @ApiProperty({
    enum: TrackAccessStatus,
    description: 'Trạng thái truy cập của user đối với track',
  })
  accessStatus: TrackAccessStatus;

  @ApiProperty({
    description: 'Lý do track bị khóa (nếu có)',
    nullable: true,
  })
  lockedReason: string | null;

  @ApiProperty({
    description: 'ID của bài học tiếp theo cần học trong track',
    nullable: true,
  })
  currentLessonId: string | null;
}

export class TrackDetailDto {
  @ApiProperty({ description: 'ID của Track' })
  id: string;

  @ApiProperty({ description: 'Tiêu đề Track' })
  title: string;

  @ApiProperty({ description: 'Thời gian ước tính hoàn thành track' })
  estimatedTime: string;

  @ApiProperty({ description: 'Thứ tự sắp xếp của track' })
  order: number;

  @ApiProperty({ description: 'Icon hiển thị của track' })
  icon: string;

  @ApiProperty({
    enum: TrackStatus,
    description: 'Trạng thái học tập của track đối với user',
  })
  status: TrackStatus;

  @ApiProperty({ description: 'Số lượng bài học đã hoàn thành trong track' })
  lessonsCompleted: number;

  @ApiProperty({ description: 'Mô tả chi tiết nội dung track' })
  description: string;

  @ApiProperty({
    type: [LessonProgressItemDto],
    description: 'Danh sách bài học trong track kèm trạng thái hoàn thành',
  })
  lessons: LessonProgressItemDto[];

  @ApiProperty({
    description: 'Cấp độ khó của Track/Course',
    example: 'Beginner',
  })
  level: string;

  @ApiProperty({
    description: 'Đường dẫn ảnh thumbnail của Track',
    nullable: true,
  })
  thumbnail: string | null;

  @ApiProperty({
    enum: TrackAccessStatus,
    description: 'Trạng thái truy cập của user đối với track',
  })
  accessStatus: TrackAccessStatus;

  @ApiProperty({
    description: 'Lý do track bị khóa (nếu có)',
    nullable: true,
  })
  lockedReason: string | null;

  @ApiProperty({
    description: 'ID của bài học tiếp theo cần học trong track',
    nullable: true,
  })
  currentLessonId: string | null;

  @ApiProperty({
    nullable: true,
    description: 'Thông tin track phía trước',
  })
  prevTrack: { id: string; title: string } | null;

  @ApiProperty({
    nullable: true,
    description: 'Thông tin track kế tiếp',
  })
  nextTrack: { id: string; title: string } | null;
}

export class TrackMetaDto {
  @ApiProperty({ description: 'Tổng số tracks' })
  total: number;

  @ApiProperty({ description: 'Trang hiện tại' })
  page: number;

  @ApiProperty({ description: 'Số lượng phần tử trên mỗi trang' })
  limit: number;

  @ApiProperty({ description: 'Tổng số trang' })
  lastPage: number;
}

export class TrackListResponseDto {
  @ApiProperty({ type: [TrackSummaryDto] })
  data: TrackSummaryDto[];

  @ApiProperty()
  meta: TrackMetaDto;
}

export class LessonListResponseDto {
  @ApiProperty({ type: [LessonProgressItemDto] })
  data: LessonProgressItemDto[];
}

export class CompleteLessonResponseDto {
  @ApiProperty({ description: 'ID của bài học vừa hoàn thành' })
  lessonId: string;

  @ApiProperty({ description: 'ID của track chứa bài học' })
  trackId: string;

  @ApiProperty({ description: 'Số lượng bài học đã hoàn thành trong track' })
  lessonsCompleted: number;

  @ApiProperty({
    enum: TrackStatus,
    description: 'Trạng thái học tập của track sau khi hoàn thành bài học',
  })
  trackStatus: TrackStatus;

  @ApiProperty({ description: 'XP được thưởng từ bài học này' })
  xpAwarded: number;

  @ApiProperty({ description: 'Tổng điểm XP hiện tại của user' })
  totalXp: number;

  @ApiProperty({ description: 'Cấp độ hiện tại của user' })
  level: number;

  @ApiProperty({
    nullable: true,
    description: 'ID của track tiếp theo vừa được mở khóa (nếu có)',
  })
  unlockedTrackId: string | null;

  @ApiProperty({ description: 'Thông báo kết quả' })
  message: string;
}

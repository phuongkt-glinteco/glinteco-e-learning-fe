import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SubmissionStatus } from '../../database/entities/submission.entity';

export class ReviewSubmissionDto {
  @ApiProperty({
    description: 'Trạng thái đánh giá mới của bài nộp.',
    enum: SubmissionStatus,
    example: SubmissionStatus.APPROVED,
  })
  @IsNotEmpty({ message: 'Trạng thái đánh giá không được để trống' })
  @IsEnum(SubmissionStatus, {
    message:
      'Trạng thái đánh giá phải là một trong các giá trị: pending, reviewed, approved, rejected',
  })
  status: SubmissionStatus;

  @ApiPropertyOptional({
    description: 'Ý kiến, phản hồi chi tiết từ Admin hoặc người đánh giá.',
    example: 'Great job on the component structure!',
  })
  @IsOptional()
  @IsString({ message: 'Phản hồi phải là một chuỗi ký tự' })
  comment?: string;
}

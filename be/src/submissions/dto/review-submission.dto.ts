import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SubmissionStatus } from '../../database/entities/submission.entity';

export class ReviewSubmissionDto {
  @ApiProperty({
    description: 'Trạng thái đánh giá bài nộp',
    enum: [
      SubmissionStatus.APPROVED,
      SubmissionStatus.REJECTED,
      SubmissionStatus.CHANGES,
    ],
    example: SubmissionStatus.APPROVED,
  })
  @IsEnum(
    [
      SubmissionStatus.APPROVED,
      SubmissionStatus.REJECTED,
      SubmissionStatus.CHANGES,
    ],
    {
      message: 'Trạng thái review không hợp lệ',
    },
  )
  @IsNotEmpty({ message: 'status không được để trống' })
  status: SubmissionStatus;

  @ApiPropertyOptional({
    description: 'Nhận xét/góp ý của người chấm',
    example: 'Great job on the component structure!',
  })
  @IsString({ message: 'comment phải là chuỗi' })
  @IsOptional()
  comment?: string;
}

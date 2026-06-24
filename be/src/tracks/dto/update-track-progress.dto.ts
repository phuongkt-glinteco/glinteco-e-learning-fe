import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProgressStatus } from '../../database/entities/track-progress.entity';

export class UpdateTrackProgressDto {
  @ApiProperty({
    description: 'Trạng thái tiến độ học của Track',
    enum: ProgressStatus,
    example: ProgressStatus.IN_PROGRESS,
  })
  @IsEnum(ProgressStatus, {
    message: `status phải là một trong các giá trị: ${Object.values(ProgressStatus).join(', ')}`,
  })
  @IsNotEmpty({ message: 'status không được để trống' })
  status: ProgressStatus;
}

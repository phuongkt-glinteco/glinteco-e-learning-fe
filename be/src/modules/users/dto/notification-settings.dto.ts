import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class NotificationSettingsDto {
  @ApiProperty()
  EXERCISE_REVIEWED: boolean;

  @ApiProperty()
  EXERCISE_CHANGES_REQUESTED: boolean;

  @ApiProperty()
  COHORT_ASSIGNED: boolean;

  @ApiProperty()
  NEW_LESSON_PUBLISHED: boolean;
}

export class UpdateNotificationSettingsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  EXERCISE_REVIEWED?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  EXERCISE_CHANGES_REQUESTED?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  COHORT_ASSIGNED?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  NEW_LESSON_PUBLISHED?: boolean;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsInt, Min } from 'class-validator';

export class UpdateLessonDto {
  @ApiPropertyOptional({
    description: 'Tiêu đề bài học',
    example: 'Advanced React',
    maxLength: 255,
  })
  @IsString({ message: 'title phải là chuỗi' })
  @IsOptional()
  @MaxLength(255, { message: 'title không được vượt quá 255 ký tự' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Thứ tự của bài học trong lộ trình',
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: 'order phải là số nguyên' })
  @Min(1, { message: 'order phải lớn hơn hoặc bằng 1' })
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: 'Thời gian ước tính hoàn thành bài học',
    example: '30m',
  })
  @IsString({ message: 'estimatedTime phải là chuỗi' })
  @IsOptional()
  estimatedTime?: string;

  @ApiPropertyOptional({
    description: 'Nội dung bài học',
    example: 'Updated lesson body...',
  })
  @IsString({ message: 'body phải là chuỗi' })
  @IsOptional()
  body?: string;
}

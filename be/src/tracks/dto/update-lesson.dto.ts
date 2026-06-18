import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsInt, Min } from 'class-validator';

export class UpdateLessonDto {
  @ApiPropertyOptional({
    description: 'Tên bài học',
    example: 'Advanced React',
    maxLength: 255,
  })
  @IsString({ message: 'name phải là chuỗi' })
  @IsOptional()
  @MaxLength(255, { message: 'name không được vượt quá 255 ký tự' })
  name?: string;

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
    description: 'Nội dung bài học',
    example: 'Updated lesson content...',
  })
  @IsString({ message: 'content phải là chuỗi' })
  @IsOptional()
  content?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsInt, Min, IsOptional } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: 'Tiêu đề bài học',
    example: 'Introduction to React',
    maxLength: 255,
  })
  @IsString({ message: 'title phải là chuỗi' })
  @IsNotEmpty({ message: 'title không được để trống' })
  @MaxLength(255, { message: 'title không được vượt quá 255 ký tự' })
  title: string;

  @ApiProperty({
    type: String,
    description: 'Mô tả ngắn của bài học',
    example: 'Introduction to React concepts',
    required: false,
    nullable: true,
  })
  @IsString({ message: 'description phải là chuỗi' })
  @IsOptional()
  description?: string | null;

  @ApiProperty({
    description: 'Thứ tự của bài học trong lộ trình',
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: 'order phải là số nguyên' })
  @Min(1, { message: 'order phải lớn hơn hoặc bằng 1' })
  @IsNotEmpty({ message: 'order không được để trống' })
  order: number;

  @ApiProperty({
    description: 'Thời gian ước tính hoàn thành bài học',
    example: '30m',
  })
  @IsString({ message: 'estimatedTime phải là chuỗi' })
  @IsNotEmpty({ message: 'estimatedTime không được để trống' })
  estimatedTime: string;

  @ApiProperty({
    description: 'Nội dung bài học',
    example: 'Lesson body here...',
  })
  @IsString({ message: 'body phải là chuỗi' })
  @IsNotEmpty({ message: 'body không được để trống' })
  body: string;
}

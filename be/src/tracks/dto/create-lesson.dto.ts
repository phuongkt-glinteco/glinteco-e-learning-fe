import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsInt, Min } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: 'Tên bài học',
    example: 'Introduction to React',
    maxLength: 255,
  })
  @IsString({ message: 'name phải là chuỗi' })
  @IsNotEmpty({ message: 'name không được để trống' })
  @MaxLength(255, { message: 'name không được vượt quá 255 ký tự' })
  name: string;

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
    description: 'Nội dung bài học',
    example: 'Lesson content here...',
  })
  @IsString({ message: 'content phải là chuỗi' })
  @IsNotEmpty({ message: 'content không được để trống' })
  content: string;
}

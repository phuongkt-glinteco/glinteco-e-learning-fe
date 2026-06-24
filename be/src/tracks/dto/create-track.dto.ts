import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsInt, Min, IsOptional } from 'class-validator';

export class CreateTrackDto {
  @ApiProperty({
    description: 'Tên lộ trình học (tiêu đề)',
    example: 'GraphQL Gateway',
    maxLength: 100,
  })
  @IsString({ message: 'title phải là chuỗi' })
  @IsNotEmpty({ message: 'title không được để trống' })
  @MaxLength(100, { message: 'title không được vượt quá 100 ký tự' })
  title: string;

  @ApiProperty({
    description: 'Mô tả lộ trình học',
    example: 'Federated schema, resolvers, and the gateway pattern.',
  })
  @IsString({ message: 'description phải là chuỗi' })
  @IsNotEmpty({ message: 'description không được để trống' })
  description: string;

  @ApiProperty({
    description: 'Thời gian ước tính',
    example: '2h',
  })
  @IsString({ message: 'estimatedTime phải là chuỗi' })
  @IsNotEmpty({ message: 'estimatedTime không được để trống' })
  estimatedTime: string;

  @ApiProperty({
    description: 'Số lượng bài học',
    example: 4,
    minimum: 0,
  })
  @IsInt({ message: 'lessonCount phải là số nguyên' })
  @Min(0, { message: 'lessonCount phải lớn hơn hoặc bằng 0' })
  @IsNotEmpty({ message: 'lessonCount không được để trống' })
  lessonCount: number;

  @ApiPropertyOptional({
    description: 'Chèn sau Track có ID này (để tự động tính toán order). Nếu bỏ trống sẽ chèn cuối cùng.',
    example: 't4',
  })
  @IsString({ message: 'afterTrackId phải là chuỗi' })
  @IsOptional()
  afterTrackId?: string;
}

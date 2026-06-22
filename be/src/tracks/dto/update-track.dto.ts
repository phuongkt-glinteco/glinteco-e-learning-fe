import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateTrackDto {
  @ApiPropertyOptional({
    description: 'Tên lộ trình học (tiêu đề)',
    example: 'Advanced Frontend',
    maxLength: 100,
  })
  @IsString({ message: 'title phải là chuỗi' })
  @IsOptional()
  @MaxLength(100, { message: 'title không được vượt quá 100 ký tự' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Mô tả lộ trình học',
    example: 'Updated description here.',
  })
  @IsString({ message: 'description phải là chuỗi' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Thời gian ước tính',
    example: '3h',
  })
  @IsString({ message: 'estimatedTime phải là chuỗi' })
  @IsOptional()
  estimatedTime?: string;

  @ApiPropertyOptional({
    description: 'Icon đại diện',
    example: 'sitemap',
  })
  @IsString({ message: 'icon phải là chuỗi' })
  @IsOptional()
  icon?: string;
}

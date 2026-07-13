import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { TagCategory } from '../../database/entities/tag.entity';

export class CreateTagDto {
  @ApiProperty({
    description: 'Tên thẻ phân loại',
    example: 'NestJS',
    maxLength: 50,
  })
  @IsString({ message: 'name phải là chuỗi' })
  @IsNotEmpty({ message: 'name không được để trống' })
  @MaxLength(50, { message: 'name không được vượt quá 50 ký tự' })
  name: string;

  @ApiPropertyOptional({
    description: 'Phân loại bể tag (GLI-94). Mặc định: GENERAL.',
    enum: TagCategory,
    example: TagCategory.TRACK,
  })
  @IsEnum(TagCategory, {
    message: 'category phải là một trong: TRACK, EXERCISE, DOCUMENT, GENERAL',
  })
  @IsOptional()
  category?: TagCategory;
}

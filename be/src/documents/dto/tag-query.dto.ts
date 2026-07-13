import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TagCategory } from '../../database/entities/tag.entity';

export class TagQueryDto {
  @ApiPropertyOptional({
    description: 'Lọc tag theo phân loại (GLI-94)',
    enum: TagCategory,
    example: TagCategory.TRACK,
  })
  @IsEnum(TagCategory, {
    message: 'category phải là một trong: TRACK, EXERCISE, DOCUMENT, GENERAL',
  })
  @IsOptional()
  category?: TagCategory;
}

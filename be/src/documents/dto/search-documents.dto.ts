import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchDocumentsDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm trong tiêu đề hoặc nội dung tài liệu',
    example: 'auth',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Danh sách các thẻ phân loại (tags) phân tách bằng dấu phẩy',
    example: 'NestJS,Architecture',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({
    description: 'Phân loại tài liệu kỹ thuật',
    enum: ['Guide', 'Reference', 'Runbook', 'Tutorial', 'Link'],
    example: 'Guide',
  })
  @IsOptional()
  @IsString()
  kind?: string;

  @ApiPropertyOptional({
    description: 'Số lượng tài liệu tối đa trả về trên mỗi trang',
    minimum: 1,
    maximum: 50,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Con trỏ (cursor) phục vụ phân trang',
    example: 'eyJpZCI6ImRiNmE2NzYzIn0=',
  })
  @IsOptional()
  @IsString()
  cursor?: string;
}

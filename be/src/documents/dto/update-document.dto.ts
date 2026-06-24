import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { DocumentKind } from '../../database/entities/document.entity';

export class UpdateDocumentDto {
  @ApiPropertyOptional({
    description: 'Tiêu đề tài liệu',
    example: 'React Hooks Cheatsheet',
    maxLength: 255,
  })
  @IsString({ message: 'title phải là chuỗi' })
  @IsOptional()
  @MaxLength(255, { message: 'title không được vượt quá 255 ký tự' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Nội dung tài liệu hoặc mô tả ngắn',
    example: 'Nội dung chi tiết tài liệu...',
  })
  @IsString({ message: 'content phải là chuỗi' })
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Đường dẫn liên kết bên ngoài (nếu có)',
    example: 'https://reactjs.org/docs/hooks-intro.html',
  })
  @IsString({ message: 'url phải là chuỗi' })
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({
    description: 'Phân loại tài liệu',
    enum: DocumentKind,
    example: DocumentKind.GUIDE,
  })
  @IsEnum(DocumentKind, {
    message: `kind phải là một trong các giá trị: ${Object.values(DocumentKind).join(', ')}`,
  })
  @IsOptional()
  kind?: DocumentKind;

  @ApiPropertyOptional({
    description: 'Danh sách các ID của thẻ phân loại (Tags) liên kết',
    type: [String],
    example: ['a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'],
  })
  @IsArray({ message: 'tagIds phải là một mảng' })
  @IsUUID('4', { each: true, message: 'Mỗi tagId phải là một UUID hợp lệ' })
  @IsOptional()
  tagIds?: string[];
}

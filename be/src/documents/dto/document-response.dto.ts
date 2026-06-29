import { ApiProperty } from '@nestjs/swagger';
import { DocumentKind } from '../../database/entities/document.entity';

export class TagResponseDto {
  @ApiProperty({ description: 'ID của tag', example: 't1' })
  id: string;

  @ApiProperty({ description: 'Tên của tag', example: 'NestJS' })
  name: string;
}

export class DocumentResponseDto {
  @ApiProperty({
    description: 'ID của tài liệu kỹ thuật',
    example: 'd5c5896b-07b9-4a0b-8d76-e17f0a9d9bf2',
  })
  id: string;

  @ApiProperty({
    description: 'Tiêu đề tài liệu',
    example: 'Hướng dẫn cài đặt',
  })
  title: string;

  @ApiProperty({
    description: 'Nội dung chi tiết tài liệu (nếu có)',
    nullable: true,
    example: 'Nội dung hướng dẫn...',
  })
  content: string | null;

  @ApiProperty({
    description: 'Đường dẫn liên kết tài liệu (nếu có)',
    nullable: true,
    example: 'https://docs.example.com',
  })
  url: string | null;

  @ApiProperty({
    enum: DocumentKind,
    description: 'Phân loại tài liệu',
    example: DocumentKind.GUIDE,
  })
  kind: DocumentKind;

  @ApiProperty({
    type: [TagResponseDto],
    description: 'Danh sách các tag của tài liệu',
  })
  tags: TagResponseDto[];

  @ApiProperty({ description: 'Trạng thái bookmark của user', example: false })
  isBookmarked: boolean;
}

export class DocumentListResponseDto {
  @ApiProperty({ type: [DocumentResponseDto] })
  data: DocumentResponseDto[];

  @ApiProperty({
    description: 'Con trỏ trang tiếp theo',
    nullable: true,
    example: 'eyJjcmVhdGVkQXQiOiIyMDI2... ',
  })
  nextCursor: string | null;

  @ApiProperty({
    description: 'Còn dữ liệu trang kế tiếp không',
    example: true,
  })
  hasMore: boolean;
}

export class RecentDocumentsResponseDto {
  @ApiProperty({ type: [DocumentResponseDto] })
  data: DocumentResponseDto[];
}

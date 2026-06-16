import { ApiProperty } from '@nestjs/swagger';

export class BookmarkResponseDto {
  @ApiProperty({
    description: 'ID của tài liệu kỹ thuật',
    example: 'd5c5896b-07b9-4a0b-8d76-e17f0a9d9bf2',
  })
  documentId: string;

  @ApiProperty({
    description: 'Trạng thái bookmark hiện tại của tài liệu đối với người dùng',
    example: true,
  })
  bookmarked: boolean;
}

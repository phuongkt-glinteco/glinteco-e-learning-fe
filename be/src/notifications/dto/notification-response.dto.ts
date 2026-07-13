import { ApiProperty } from '@nestjs/swagger';

export class NotificationItemDto {
  @ApiProperty({ description: 'ID của thông báo' })
  id: string;

  @ApiProperty({
    description: 'Loại thông báo (ví dụ: submission, general)',
    example: 'general',
  })
  type: string;

  @ApiProperty({ description: 'Tiêu đề thông báo' })
  title: string;

  @ApiProperty({ description: 'Nội dung thông báo' })
  body: string;

  @ApiProperty({ description: 'Trạng thái đã đọc hay chưa' })
  read: boolean;

  @ApiProperty({ description: 'Thời gian tạo thông báo' })
  createdAt: Date;
}

export class NotificationListResponseDto {
  @ApiProperty({
    type: [NotificationItemDto],
    description: 'Danh sách thông báo',
  })
  data: NotificationItemDto[];

  @ApiProperty({ description: 'Số lượng thông báo chưa đọc' })
  unreadCount: number;
}

export class MarkReadResponseDto {
  @ApiProperty({ description: 'ID của thông báo' })
  id: string;

  @ApiProperty({ description: 'Trạng thái đã đọc' })
  read: boolean;
}

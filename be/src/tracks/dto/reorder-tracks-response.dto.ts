import { ApiProperty } from '@nestjs/swagger';

export class ReorderTracksResponseDto {
  @ApiProperty({
    description: 'Thông báo kết quả.',
    example: 'Tracks reordered',
  })
  message: string;

  @ApiProperty({
    description: 'Số lượng track đã được cập nhật thứ tự.',
    example: 2,
  })
  count: number;
}

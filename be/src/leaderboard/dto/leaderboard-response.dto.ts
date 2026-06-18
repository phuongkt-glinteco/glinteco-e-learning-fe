import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryDto {
  @ApiProperty({ description: 'ID của học viên.' })
  userId: string;

  @ApiProperty({ description: 'Họ tên của học viên.' })
  name: string;

  @ApiProperty({ description: 'Cấp độ hiện tại của học viên.' })
  level: number;

  @ApiProperty({ description: 'Tổng điểm kinh nghiệm tích lũy.' })
  xp: number;

  @ApiProperty({ description: 'Số ngày streak liên tục hiện tại.' })
  streakDays: number;

  @ApiProperty({ description: 'Thứ hạng của học viên trên bảng xếp hạng.' })
  rank: number;
}

export class LeaderboardResponseDto {
  @ApiProperty({
    type: [LeaderboardEntryDto],
    description: 'Danh sách học viên trên bảng xếp hạng.',
  })
  data: LeaderboardEntryDto[];

  @ApiProperty({
    description:
      'Con trỏ base64 cho trang tiếp theo (null nếu không còn trang kế).',
    nullable: true,
  })
  nextCursor: string | null;

  @ApiProperty({ description: 'Có còn trang kế tiếp hay không.' })
  hasMore: boolean;
}

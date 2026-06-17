import { ApiProperty } from '@nestjs/swagger';

export class SearchTrackResultDto {
  @ApiProperty({ example: 't3', description: 'ID của Track' })
  id: string;

  @ApiProperty({ example: 'NestJS Service Layer', description: 'Tên của Track' })
  title: string;
}

export class SearchDocumentResultDto {
  @ApiProperty({ example: 'd5', description: 'ID của Document' })
  id: string;

  @ApiProperty({ example: 'Service Auth & JWT Flow', description: 'Tiêu đề Document' })
  title: string;

  @ApiProperty({
    example: 'Guide',
    description: 'Loại tài liệu',
    enum: ['Guide', 'Reference', 'Runbook', 'Tutorial', 'Link'],
  })
  kind: 'Guide' | 'Reference' | 'Runbook' | 'Tutorial' | 'Link';
}

export class SearchExerciseResultDto {
  @ApiProperty({ example: 'e4', description: 'ID của Exercise' })
  id: string;

  @ApiProperty({ example: 'Service Auth Middleware', description: 'Tiêu đề bài tập' })
  title: string;

  @ApiProperty({ example: 'NestJS', description: 'Tên của Track chứa bài tập này' })
  tag: string;
}

export class SearchResponseDto {
  @ApiProperty({ type: [SearchTrackResultDto], description: 'Danh sách Tracks tìm thấy' })
  tracks: SearchTrackResultDto[];

  @ApiProperty({ type: [SearchDocumentResultDto], description: 'Danh sách Documents tìm thấy' })
  documents: SearchDocumentResultDto[];

  @ApiProperty({ type: [SearchExerciseResultDto], description: 'Danh sách Exercises tìm thấy' })
  exercises: SearchExerciseResultDto[];
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({
    description: 'Đường dẫn GitHub PR của bài nộp',
    example: 'https://github.com/user/repo/pull/1',
  })
  @IsString({ message: 'prUrl phải là chuỗi' })
  @IsNotEmpty({ message: 'prUrl không được để trống' })
  prUrl: string;
}

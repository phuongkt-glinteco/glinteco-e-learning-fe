import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl, Matches } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({
    description: 'URL của Pull Request GitHub chứa bài giải bài tập thực hành.',
    example: 'https://github.com/acme/web/pull/468',
  })
  @IsNotEmpty({ message: 'prUrl không được để trống' })
  @IsUrl({}, { message: 'prUrl phải là một đường dẫn URL hợp lệ' })
  @Matches(
    /^https:\/\/github\.com\/[a-zA-Z0-9-._]+\/[a-zA-Z0-9-._]+\/pull\/\d+$/,
    {
      message:
        'prUrl phải là một đường dẫn Pull Request của GitHub (ví dụ: https://github.com/owner/repo/pull/1)',
    },
  )
  prUrl: string;
}

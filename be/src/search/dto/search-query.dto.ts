import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm toàn cục',
    example: 'auth',
    required: true,
  })
  @IsNotEmpty({ message: 'Từ khóa tìm kiếm không được để trống' })
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  @MinLength(1, { message: 'Từ khóa tìm kiếm phải có ít nhất 1 ký tự' })
  q: string;
}

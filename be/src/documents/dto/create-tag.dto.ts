import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({
    description: 'Tên thẻ phân loại',
    example: 'NestJS',
    maxLength: 50,
  })
  @IsString({ message: 'name phải là chuỗi' })
  @IsNotEmpty({ message: 'name không được để trống' })
  @MaxLength(50, { message: 'name không được vượt quá 50 ký tự' })
  name: string;
}

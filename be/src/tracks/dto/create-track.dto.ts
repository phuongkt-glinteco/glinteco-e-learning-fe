import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsInt, Min } from 'class-validator';

export class CreateTrackDto {
  @ApiProperty({
    description: 'Tên lộ trình học',
    example: 'Frontend Basics',
    maxLength: 100,
  })
  @IsString({ message: 'name phải là chuỗi' })
  @IsNotEmpty({ message: 'name không được để trống' })
  @MaxLength(100, { message: 'name không được vượt quá 100 ký tự' })
  name: string;

  @ApiProperty({
    description: 'Thứ tự sắp xếp của lộ trình',
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: 'order phải là số nguyên' })
  @Min(1, { message: 'order phải lớn hơn hoặc bằng 1' })
  @IsNotEmpty({ message: 'order không được để trống' })
  order: number;
}

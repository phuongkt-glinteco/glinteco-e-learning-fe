import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class ReorderTracksDto {
  @ApiProperty({
    description:
      'Danh sách ID (UUID) của các tracks được sắp xếp lại theo thứ tự mới.',
    type: [String],
    example: [
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    ],
  })
  @IsArray({ message: 'order phải là một mảng' })
  @ArrayNotEmpty({ message: 'Danh sách order không được để trống' })
  @IsUUID('4', {
    each: true,
    message: 'Mỗi phần tử trong order phải là một UUID hợp lệ',
  })
  @ArrayUnique({ message: 'Các ID trong danh sách order không được trùng lặp' })
  order: string[];
}

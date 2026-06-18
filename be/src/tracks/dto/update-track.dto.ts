import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsInt, Min } from 'class-validator';

export class UpdateTrackDto {
  @ApiPropertyOptional({
    description: 'Tên lộ trình học',
    example: 'Advanced Frontend',
    maxLength: 100,
  })
  @IsString({ message: 'name phải là chuỗi' })
  @IsOptional()
  @MaxLength(100, { message: 'name không được vượt quá 100 ký tự' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp của lộ trình',
    example: 1,
    minimum: 1,
  })
  @IsInt({ message: 'order phải là số nguyên' })
  @Min(1, { message: 'order phải lớn hơn hoặc bằng 1' })
  @IsOptional()
  order?: number;
}

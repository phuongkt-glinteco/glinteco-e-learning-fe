import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class UserQueryDto {
  @ApiProperty({ required: false, description: 'Lọc theo Cohort ID (UUID).' })
  @IsOptional()
  @IsUUID('4', { message: 'cohortId phải là một UUID hợp lệ' })
  cohortId?: string;

  @ApiProperty({ required: false, description: 'Lọc theo vai trò (learner / admin).' })
  @IsOptional()
  @IsString({ message: 'role phải là chuỗi ký tự' })
  role?: string;

  @ApiProperty({ required: false, description: 'Tìm kiếm theo tên hoặc email.' })
  @IsOptional()
  @IsString({ message: 'q phải là chuỗi ký tự' })
  q?: string;

  @ApiProperty({ required: false, description: 'Số trang.', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Số lượng phần tử mỗi trang.', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}

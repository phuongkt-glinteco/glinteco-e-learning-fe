import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBooleanString } from 'class-validator';
import { UserRole } from '../../../database/entities/user.entity';

export class AdminUserQueryDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên hoặc email.' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: UserRole, description: 'Lọc theo vai trò.' })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái hoạt động.' })
  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @ApiPropertyOptional({ description: 'Số trang.', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Số lượng phần tử mỗi trang.',
    default: 20,
  })
  @IsOptional()
  limit?: number;
}

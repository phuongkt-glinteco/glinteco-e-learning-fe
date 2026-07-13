import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../../../database/entities/user.entity';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: UserRole,
    description: 'Vai trò mới của người dùng.',
    example: UserRole.ADMIN,
  })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;
}

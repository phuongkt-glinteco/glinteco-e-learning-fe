import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsUUID, ValidateIf } from 'class-validator';
import { UserRole } from '../../../database/entities/user.entity';

export class UpdateUserAdminDto {
  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Vai trò mới của người dùng.',
    example: UserRole.LEARNER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description:
      'ID của cohort gán cho người dùng (UUID, gửi null để hủy gán).',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o) => o.cohortId !== null)
  @IsUUID('4', { message: 'cohortId phải là UUID hợp lệ' })
  cohortId?: string | null;
}

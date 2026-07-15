import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignCohortDto {
  @ApiProperty({
    description: 'ID của cohort (UUID) cần gán cho người dùng.',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsNotEmpty({ message: 'cohortId không được để trống' })
  @IsUUID('4', { message: 'cohortId phải là UUID hợp lệ' })
  cohortId: string;
}

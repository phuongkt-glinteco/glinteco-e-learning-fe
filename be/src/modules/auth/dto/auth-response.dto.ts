import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../database/entities/user.entity';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ type: String, nullable: true })
  title: string | null;

  @ApiProperty()
  avatarHue: number;

  @ApiProperty({ type: String, nullable: true })
  cohortId: string | null;

  @ApiProperty()
  level: number;

  @ApiProperty()
  xp: number;

  @ApiProperty({ description: 'Số ngày streak hiện tại của user.' })
  streakDays: number;

  @ApiProperty()
  joinedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: UserProfileDto })
  user: UserProfileDto;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'A valid, previously issued refresh token (JWT).',
  })
  @IsString()
  @IsNotEmpty()
  @IsJWT({ message: 'Refresh token không hợp lệ' })
  refreshToken: string;
}

import { ApiProperty } from '@nestjs/swagger';

/**
 * Token pair returned by login and refresh. `expiresIn` is the access-token
 * lifetime in seconds.
 */
export class AuthTokensDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({
    description: 'Access token lifetime in seconds.',
    example: 900,
  })
  expiresIn: number;
}

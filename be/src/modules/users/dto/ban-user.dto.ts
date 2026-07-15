import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class BanUserDto {
  @ApiProperty({
    description: 'Lý do khóa tài khoản.',
    example: 'Vi phạm quy chế thi cử',
  })
  @IsNotEmpty({ message: 'Lý do khóa tài khoản không được để trống' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description:
      'Thời hạn khóa tài khoản (nếu để trống hoặc null tức là khóa vĩnh viễn).',
    example: '2026-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date | null;
}

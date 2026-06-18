import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Mã token khôi phục mật khẩu nhận được từ email.',
    example: 'abc123xyz...',
  })
  @IsNotEmpty({ message: 'Token không được để trống' })
  @IsString({ message: 'Token phải là một chuỗi ký tự' })
  token: string;

  @ApiProperty({
    description: 'Mật khẩu mới.',
    example: 'NewSecurePassword123',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là một chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có tối thiểu 6 ký tự' })
  password: string;
}

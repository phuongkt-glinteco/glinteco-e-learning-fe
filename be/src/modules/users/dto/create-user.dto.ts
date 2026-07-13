import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../../../database/entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'Địa chỉ email.',
    example: 'user@company.com',
  })
  @IsEmail({}, { message: 'Định dạng email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    description: 'Họ tên người dùng.',
    example: 'Nguyễn Văn A',
  })
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  name: string;

  @ApiProperty({
    description: 'Mật khẩu khởi tạo.',
    example: 'SecurePassword123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(8, { message: 'Mật khẩu phải chứa ít nhất 8 ký tự' })
  password: string;

  @ApiPropertyOptional({
    enum: UserRole,
    description: 'Vai trò người dùng.',
    default: UserRole.LEARNER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

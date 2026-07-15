import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({ description: 'Trạng thái thành công' })
  success: boolean;

  @ApiProperty({ description: 'Thông điệp phản hồi' })
  message: string;

  @ApiProperty({
    description:
      'Token khôi phục mật khẩu (chỉ trả về ở dev/test hoặc cấu hình)',
    required: false,
  })
  resetToken?: string;

  @ApiProperty({ description: 'Đường dẫn đặt lại mật khẩu', required: false })
  resetUrl?: string;
}

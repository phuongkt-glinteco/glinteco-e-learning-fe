import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { GoogleLoginDto } from './dto/google-login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập / đăng ký bằng Google OAuth 2.0',
    description:
      'Xác thực Google ID Token, kiểm tra domain công ty, tạo user nếu chưa tồn tại và trả về cặp JWT token.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'ID Token không hợp lệ.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Email ngoài domain công ty.',
  })
  async googleLogin(@Body() dto: GoogleLoginDto): Promise<AuthResponseDto> {
    return this.authService.loginWithGoogle(dto.idToken);
  }
}

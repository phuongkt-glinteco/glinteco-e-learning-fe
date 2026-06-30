import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';
import { createHash, randomUUID, randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  JwtPayload,
  RefreshTokenPayload,
} from './interfaces/jwt-payload.interface';
import { MailService } from '../../mail/mail.service';

const SALT_ROUNDS = 10;
const DEFAULT_ACCESS_EXPIRES_IN = 900; // 15 minutes
const DEFAULT_REFRESH_EXPIRES_IN = 604800; // 7 days

/**
 * User-facing shape of a user record: the entity with the password hash
 * stripped, regardless of how it was loaded.
 */
export type SafeUser = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string;
  private readonly allowedDomain?: string;

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    this.googleClientId = this.configService.get<string>(
      'GOOGLE_CLIENT_ID',
      '',
    );
    this.allowedDomain = this.configService.get<string>('ALLOWED_EMAIL_DOMAIN');
    this.googleClient = new OAuth2Client(this.googleClientId);
  }

  /** Create a new local account. Email must be unique; password is bcrypt-hashed. */
  async register(dto: RegisterDto): Promise<SafeUser> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      // Approved spec returns 400 for an already-registered email.
      throw new BadRequestException('Email đã được sử dụng');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: passwordHash,
    });

    return this.sanitize(user);
  }

  /** Verify credentials and issue a fresh token pair. */
  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return this.issueTokens(user, dto.rememberMe);
  }

  /**
   * Return the user when the email/password pair is valid, otherwise null.
   * Never reveals whether the email or the password was the failing factor.
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user || !user.password) {
      return null;
    }
    const matches = await bcrypt.compare(password, user.password);
    return matches ? user : null;
  }

  /**
   * Rotate a refresh token: validate it, revoke the presented one, and issue a
   * brand-new pair. A token that fails verification, is unknown, or has been
   * rotated/revoked yields 401.
   */
  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.getRefreshSecret(),
        },
      );
    } catch {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    const stored = await this.refreshTokenRepository.findOne({
      where: { id: payload.jti, userId: payload.sub },
    });
    if (!stored || stored.token !== this.hashToken(refreshToken)) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    // Rotation: the presented refresh token can only be used once.
    await this.refreshTokenRepository.delete({ id: stored.id });

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn',
      );
    }

    return this.issueTokens(user, payload.rememberMe);
  }

  /**
   * Revoke the presented refresh token. Idempotent: an invalid token or one
   * belonging to another user is a silent no-op so logout never leaks state.
   */
  async logout(
    userId: string,
    refreshToken: string,
  ): Promise<{ message: string }> {
    const message = 'Logged out successfully';
    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.getRefreshSecret(),
        },
      );
    } catch {
      return { message };
    }

    if (payload.sub === userId) {
      await this.refreshTokenRepository.delete({ id: payload.jti, userId });
    }
    return { message };
  }

  /** Sign an access/refresh pair and persist a revocable handle for the refresh token. */
  private async issueTokens(
    user: User,
    rememberMe = true,
  ): Promise<AuthTokensDto> {
    const accessExpiresIn = this.getAccessExpiresIn();
    const refreshExpiresIn = rememberMe ? this.getRefreshExpiresIn() : 86400; // 1 day if rememberMe is false
    const jti = randomUUID();

    const accessPayload: JwtPayload = { sub: user.id, email: user.email };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      jti,
      rememberMe,
    };

    const accessToken = await this.jwtService.signAsync(accessPayload, {
      secret: this.getAccessSecret(),
      expiresIn: accessExpiresIn,
    });
    const refreshToken = await this.jwtService.signAsync(refreshPayload, {
      secret: this.getRefreshSecret(),
      expiresIn: refreshExpiresIn,
    });

    await this.refreshTokenRepository.save(
      this.refreshTokenRepository.create({
        id: jti,
        token: this.hashToken(refreshToken),
        expiresAt: new Date(Date.now() + refreshExpiresIn * 1000),
        userId: user.id,
      }),
    );

    return { accessToken, refreshToken, expiresIn: accessExpiresIn };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private sanitize(user: User): SafeUser {
    const safe: SafeUser = { ...user };
    delete (safe as Partial<User>).password;
    return safe;
  }

  private getAccessSecret(): string {
    return this.configService.get<string>(
      'JWT_SECRET',
      'super-secret-jwt-key-for-ramp-up',
    );
  }

  private getRefreshSecret(): string {
    return this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      this.getAccessSecret() + '-refresh',
    );
  }

  private getAccessExpiresIn(): number {
    return Number(
      this.configService.get('JWT_EXPIRES_IN', DEFAULT_ACCESS_EXPIRES_IN),
    );
  }

  private getRefreshExpiresIn(): number {
    return Number(
      this.configService.get(
        'JWT_REFRESH_EXPIRES_IN',
        DEFAULT_REFRESH_EXPIRES_IN,
      ),
    );
  }

  /**
   * Verifies a Google ID Token, enforces company-domain policies, finds or
   * provisions the user, and returns signed JWT access/refresh tokens.
   */
  async loginWithGoogle(idToken: string): Promise<AuthResponseDto> {
    const payload = await this.verifyGoogleToken(idToken);

    const email = payload.email;
    if (!email || payload.email_verified !== true) {
      throw new UnauthorizedException('Email Google chưa được xác thực.');
    }

    this.assertAllowedDomain(email, payload.hd);

    const user = await this.findOrCreateUser(payload, email);
    return this.buildAuthResponse(user);
  }

  private async verifyGoogleToken(idToken: string): Promise<TokenPayload> {
    if (!this.googleClientId) {
      this.logger.error('GOOGLE_CLIENT_ID is not configured.');
      throw new InternalServerErrorException(
        'Google OAuth chưa được cấu hình trên server.',
      );
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.googleClientId,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('ID Token không hợp lệ.');
      }
      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.warn(`Google ID Token verification failed: ${error}`);
      throw new UnauthorizedException('ID Token không hợp lệ hoặc đã hết hạn.');
    }
  }

  private assertAllowedDomain(email: string, hostedDomain?: string): void {
    if (!this.allowedDomain) {
      return;
    }

    const matchesHostedDomain = hostedDomain === this.allowedDomain;
    const matchesEmailSuffix = email
      .toLowerCase()
      .endsWith(`@${this.allowedDomain.toLowerCase()}`);

    if (!matchesHostedDomain && !matchesEmailSuffix) {
      throw new ForbiddenException(
        'Email không thuộc tên miền công ty được phép.',
      );
    }
  }

  private async findOrCreateUser(
    payload: TokenPayload,
    email: string,
  ): Promise<User> {
    const googleId = payload.sub;
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      user = this.userRepository.create({
        email,
        name: payload.name ?? email.split('@')[0],
        googleId,
        role: UserRole.LEARNER,
        level: 1,
        xp: 0,
        streakDays: 0,
      });
      return this.userRepository.save(user);
    }

    if (!user.googleId) {
      user.googleId = googleId;
      return this.userRepository.save(user);
    }

    return user;
  }

  private async buildAuthResponse(user: User): Promise<AuthResponseDto> {
    const tokens = await this.issueTokens(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        title: user.title ?? null,
        avatarHue: user.avatarHue ?? 0,
        cohortId: user.cohortId ?? null,
        level: user.level,
        xp: user.xp,
        streakDays: user.streakDays,
        joinedAt: user.createdAt,
      },
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return {
        message:
          'Nếu tài khoản tồn tại với email này, đường dẫn khôi phục mật khẩu đã được gửi qua email.',
      };
    }

    const token = randomBytes(32).toString('hex');
    const hashedToken = createHash('sha256').update(token).digest('hex');

    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.userRepository.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expires,
    });

    const frontendUrl = this.configService
      .get<string>('FRONTEND_URL', 'http://localhost:6336')
      .replace(/\/$/, '');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    try {
      await this.mailService.sendMail({
        to: user.email,
        subject: '[RAMP UP] Reset your password',
        html: this.buildResetPasswordEmail(resetLink),
        text: `Reset your RAMP UP password: ${resetLink}`,
      });
    } catch (error) {
      await this.userRepository.update(user.id, {
        resetPasswordToken: null,
        resetPasswordExpires: null,
      });

      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Could not send password reset email',
      );
    }

    return { message: 'Đường dẫn khôi phục mật khẩu đã được gửi qua email.' };
  }

  private buildResetPasswordEmail(resetLink: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset your RAMP UP password</title>
</head>
<body style="font-family: Inter, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 32px;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
    <tr>
      <td style="padding: 24px; background: #2563eb; color: #ffffff; border-radius: 8px 8px 0 0;">
        <h1 style="font-size: 20px; margin: 0;">RAMP UP Password Reset</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        <p style="font-size: 15px; line-height: 24px;">We received a request to reset your RAMP UP password.</p>
        <p style="font-size: 15px; line-height: 24px;">Use the button below within the next hour to set a new password.</p>
        <p style="margin: 28px 0;">
          <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 6px; font-weight: 600;">Reset password</a>
        </p>
        <p style="font-size: 13px; line-height: 20px; color: #64748b;">If the button does not work, copy and paste this link into your browser:</p>
        <p style="font-size: 13px; line-height: 20px; word-break: break-all;"><a href="${resetLink}" style="color: #2563eb;">${resetLink}</a></p>
        <p style="font-size: 13px; line-height: 20px; color: #64748b;">If you did not request a password reset, you can ignore this email.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const hashedToken = createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository.findOne({
      where: {
        resetPasswordToken: hashedToken,
      },
      select: { id: true, email: true, name: true, resetPasswordExpires: true },
    });

    if (!user) {
      throw new BadRequestException(
        'Mã khôi phục mật khẩu không hợp lệ hoặc đã qua sử dụng',
      );
    }

    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      throw new BadRequestException('Mã khôi phục mật khẩu đã hết hạn');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    await this.sendPasswordChangedNotification(user);

    return { message: 'Mật khẩu đã được thay đổi thành công.' };
  }

  private async sendPasswordChangedNotification(
    user: Pick<User, 'email' | 'name'>,
  ): Promise<void> {
    const changedAt = new Date();

    try {
      await this.mailService.sendMail({
        to: user.email,
        subject: '[RAMP UP] Your password was changed',
        html: this.buildPasswordChangedEmail(user.name, changedAt),
        text: this.buildPasswordChangedText(user.name, changedAt),
      });
    } catch (error) {
      this.logger.error(
        `Password changed notification email failed for ${user.email}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  private buildPasswordChangedEmail(name: string, changedAt: Date): string {
    const displayName = name || 'there';
    const changedAtText = changedAt.toISOString();

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your RAMP UP password was changed</title>
</head>
<body style="font-family: Inter, Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; padding: 32px;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
    <tr>
      <td style="padding: 24px; background: #0f172a; color: #ffffff; border-radius: 8px 8px 0 0;">
        <h1 style="font-size: 20px; margin: 0;">RAMP UP Security Alert</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        <p style="font-size: 15px; line-height: 24px;">Hi ${displayName},</p>
        <p style="font-size: 15px; line-height: 24px;">Your RAMP UP account password was changed successfully.</p>
        <p style="font-size: 15px; line-height: 24px;">If this was you, no further action is needed.</p>
        <p style="font-size: 15px; line-height: 24px;">If you did not make this change, please contact the administrator or reset your password immediately.</p>
        <p style="font-size: 13px; line-height: 20px; color: #64748b;">Time: ${changedAtText}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private buildPasswordChangedText(name: string, changedAt: Date): string {
    const displayName = name || 'there';

    return [
      `Hi ${displayName},`,
      '',
      'Your RAMP UP account password was changed successfully.',
      '',
      'If this was you, no further action is needed.',
      'If you did not make this change, please contact the administrator or reset your password immediately.',
      '',
      `Time: ${changedAt.toISOString()}`,
    ].join('\n');
  }
}

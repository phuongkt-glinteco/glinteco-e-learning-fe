import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import * as bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';
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
    return this.issueTokens(user);
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

    return this.issueTokens(user);
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
  private async issueTokens(user: User): Promise<AuthTokensDto> {
    const accessExpiresIn = this.getAccessExpiresIn();
    const refreshExpiresIn = this.getRefreshExpiresIn();
    const jti = randomUUID();

    const accessPayload: JwtPayload = { sub: user.id, email: user.email };
    const refreshPayload: RefreshTokenPayload = { sub: user.id, jti };

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
        level: user.level,
        xp: user.xp,
        streakDays: user.streakDays,
      },
    };
  }
}

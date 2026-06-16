import {
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
import { Repository } from 'typeorm';
import { User, UserRole } from '../database/entities/user.entity';
import { AuthResponseDto, UserProfileDto } from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string;
  private readonly allowedDomain?: string;

  constructor(
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

  /**
   * Verifies a Google ID Token, enforces the company-domain policy, then finds
   * or provisions the matching user and returns a freshly signed JWT pair —
   * mirroring the response shape of a regular email/password login.
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
      // Fail closed: without an audience the token's `aud` claim is not checked.
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
      // No domain restriction configured — allow any verified Google account.
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
        // `name` is NOT NULL — fall back to the email local-part if Google
        // omitted the name claim so we never violate the constraint.
        name: payload.name ?? email.split('@')[0],
        googleId,
        role: UserRole.LEARNER,
        level: 1,
        xp: 0,
        streakDays: 0,
      });
      return this.userRepository.save(user);
    }

    // Link an existing (e.g. seeded) account to its Google identity on first
    // Google sign-in.
    if (!user.googleId) {
      user.googleId = googleId;
      return this.userRepository.save(user);
    }

    return user;
  }

  private async buildAuthResponse(user: User): Promise<AuthResponseDto> {
    const claims: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(claims);
    const refreshToken = await this.jwtService.signAsync(claims, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: Number(
        this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '604800'),
      ),
    });

    const profile: UserProfileDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      level: user.level,
      xp: user.xp,
      streakDays: user.streakDays,
    };

    return { accessToken, refreshToken, user: profile };
  }
}

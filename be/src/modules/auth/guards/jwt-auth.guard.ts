import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard protecting internal routes. Delegates to the Passport `jwt` strategy
 * and rejects requests without a valid access token with `401 Unauthorized`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

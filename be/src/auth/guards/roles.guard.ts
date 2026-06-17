import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserRole } from '../../database/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Role-based access guard. Reads the roles declared by `@Roles(...)` and only
 * lets the request through when the authenticated principal carries one of
 * them. Must run AFTER {@link JwtAuthGuard} so `request.user` is populated.
 *
 * Fails closed: if no principal is attached (e.g. the guard was applied without
 * JwtAuthGuard), access is denied rather than silently allowed.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No @Roles metadata → route is not role-restricted.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Không xác định được người dùng.');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này.',
      );
    }

    return true;
  }
}

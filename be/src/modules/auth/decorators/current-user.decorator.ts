import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../../database/entities/user.entity';

/**
 * Injects the authenticated user (populated by `JwtStrategy.validate`) into a
 * controller handler argument.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<{ user: User }>();
    return request.user;
  },
);

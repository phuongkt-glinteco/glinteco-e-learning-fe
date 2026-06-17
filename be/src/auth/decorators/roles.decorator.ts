import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../database/entities/user.entity';

/**
 * Metadata key under which the allowed roles for a route are stored. Read back
 * by {@link RolesGuard} via the Nest `Reflector`.
 */
export const ROLES_KEY = 'roles';

/**
 * Restricts a route (or controller) to the given roles. Pair with
 * `@UseGuards(JwtAuthGuard, RolesGuard)` so the JWT is validated first and the
 * decoded principal is available when the role check runs.
 *
 * @example
 *   @Roles(UserRole.ADMIN)
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   reorder() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

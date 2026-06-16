import { UserRole } from '../../database/entities/user.entity';

/**
 * Claims encoded into the signed JWTs. `sub` carries the user id so guards can
 * resolve the authenticated principal without an extra lookup.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

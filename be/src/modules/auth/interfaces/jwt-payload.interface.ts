/**
 * Claims embedded in the access token. `sub` is the user id (RFC 7519).
 */
export interface JwtPayload {
  sub: string;
  email: string;
}

/**
 * Claims embedded in the refresh token. `jti` ties the token to a persisted,
 * revocable `refresh_tokens` row so it can be rotated and invalidated.
 */
export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  rememberMe?: boolean;
}

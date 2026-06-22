import { client } from './client/client.gen';
import { mapBackendError } from './error-mapper';
import { postAuthRefresh } from './client/sdk.gen';

// Configure the correct dynamic base URL from environment variables
client.setConfig({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || client.getConfig().baseUrl,
});

// Restore auth token from localStorage synchronously so every API call
// after module init already has the bearer token (no race with AuthProvider).
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('accessToken');
  if (token) {
    client.setConfig({ auth: token });
  }
}

/**
 * Programmatically triggers a global API error popup.
 * Useful for manual error handling or testing.
 */
export function triggerApiError(code: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('api-error', { detail: { code } }));
  }
}

// ── Token Management ──────────────────────────────────────────────────

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/** Read the raw access token from localStorage (SSR-safe). */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/** Read the raw refresh token from localStorage (SSR-safe). */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/** Sync a token (or null) into the API client's auth config. */
export function setClientToken(token: string | null) {
  client.setConfig({ auth: token ?? undefined });
}

/** Persist both tokens to localStorage and update the API client. */
export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  setClientToken(accessToken);
}

/** Clear all persisted tokens and the API client auth. */
export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  setClientToken(null);
}

// ── Token Refresh (shared mutex) ──────────────────────────────────────

let refreshPromise: Promise<boolean> | null = null;
let isLoggingOut = false;

/**
 * Attempt to refresh tokens using the saved refresh token.
 * On success, updates localStorage and client config.
 * On failure, clears everything.
 */
export async function attemptTokenRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await postAuthRefresh({
      body: { refreshToken },
    });
    const { accessToken, refreshToken: newRefreshToken } = res.data ?? {};
    if (accessToken && newRefreshToken) {
      saveTokens(accessToken, newRefreshToken);
      return true;
    }
    return false;
  } catch {
    clearTokens();
    return false;
  }
}

// ── Error Interceptor: auto-refresh on 401 ────────────────────────────

client.interceptors.error.use(async (error, response, request) => {
  // Handle non-401 errors OR errors without a request object normally
  if (response?.status !== 401 || !request) {
    const mappedError = mapBackendError(error, response, request);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-error', { detail: mappedError }));
    }
    return mappedError;
  }

  // Don't loop on refresh/logout endpoints
  const url = new URL(request.url);
  if (url.pathname.endsWith('/auth/refresh') || url.pathname.endsWith('/auth/logout')) {
    return error;
  }

  // Already logging out → bail out
  if (isLoggingOut) {
    return error;
  }

  // ── Attempt token refresh ──
  if (!refreshPromise) {
    refreshPromise = attemptTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  const success = await refreshPromise;

  if (success) {
    // Retry original request with new token
    const newToken = getAccessToken();
    if (newToken) {
      request.headers.set('Authorization', `Bearer ${newToken}`);
    }
    return fetch(request);
  }

  // Refresh failed → logout and report session expired
  if (onSessionExpired) {
    isLoggingOut = true;
    onSessionExpired();
  } else {
    clearTokens();
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('api-error', { detail: { code: 'SESSION_EXPIRED' } }));
  }

  const mappedError = mapBackendError(error, response, request);
  return mappedError;
});

// ── Session Expired Callback ──────────────────────────────────────────

let onSessionExpired: (() => void) | null = null;

/**
 * Register a callback to be called when token refresh fails.
 * Useful for AuthProvider to trigger full logout (server revoke, cookie clear, redirect).
 */
export function setOnSessionExpired(callback: (() => void) | null) {
  onSessionExpired = callback;
  if (!callback) {
    isLoggingOut = false;
  }
}

// Re-export the global client and all auto-generated SDK endpoints/types
export { client };
export * from './client';
export type * from './client/types.gen';

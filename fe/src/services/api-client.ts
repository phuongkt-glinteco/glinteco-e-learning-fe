import { client } from './client/client.gen';
import { mapBackendError } from './error-mapper';
import { postAuthRefresh } from './client/sdk.gen';

// Configure the correct dynamic base URL from environment variables
client.setConfig({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || client.getConfig().baseUrl,
});

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

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

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

// ── Request Interceptor: auto-refresh expired tokens ──────────────────

client.interceptors.request.use(async (request) => {
  // Don't try to refresh when we're already hitting the refresh endpoint
  const url = new URL(request.url);
  if (url.pathname.endsWith('/auth/refresh')) return request;

  const accessToken = getAccessToken();
  if (accessToken && isTokenExpired(accessToken)) {
    if (!refreshPromise) {
      refreshPromise = attemptTokenRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    const success = await refreshPromise;
    if (success) {
      const newToken = getAccessToken();
      if (newToken) {
        // Override the stale Authorization header that was set by beforeRequest
        request.headers.set('Authorization', `Bearer ${newToken}`);
      }
    }
  }
  return request;
});

// ── Error Interceptor ─────────────────────────────────────────────────

client.interceptors.error.use((error, response, request) => {
  // Map the raw error payload/HTTP status to our custom AppError
  const mappedError = mapBackendError(error, response, request);

  // Dispatch custom event for global error UI component
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('api-error', { detail: mappedError }));
  }

  // Returning the mapped error here will cause the hey-api client to throw it as the final error
  return mappedError;
});

// Re-export the global client and all auto-generated SDK endpoints/types
export { client };
export * from './client';
export type * from './client/types.gen';

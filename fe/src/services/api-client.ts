import { client } from './client/client.gen';
import { mapBackendError } from './error-mapper';
import { postAuthRefresh } from './client/sdk.gen';

const DEFAULT_BASE_URL = 'https://api.glinteco-elearning.dev/api/v1';
client.setConfig({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL,
});

if (typeof window !== 'undefined') {
  const token = localStorage.getItem('accessToken');
  if (token) {
    client.setConfig({ auth: token });
  }
}

export function triggerApiError(code: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('api-error', { detail: { code } }));
  }
}

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setClientToken(token: string | null) {
  client.setConfig({ auth: token ?? undefined });
}

export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  setClientToken(accessToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  setClientToken(null);
}

let refreshPromise: Promise<boolean> | null = null;
let isLoggingOut = false;

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

client.interceptors.error.use(async (error, response, request) => {
  if (response?.status !== 401 || !request) {
    const mappedError = mapBackendError(error, response, request);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-error', { detail: mappedError }));
    }
    return mappedError;
  }

  const url = new URL(request.url);
  if (url.pathname.endsWith('/auth/refresh') || url.pathname.endsWith('/auth/logout')) {
    return error;
  }

  if (isLoggingOut) {
    return error;
  }

  if (!refreshPromise) {
    refreshPromise = attemptTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  const success = await refreshPromise;

  if (success) {
    const newToken = getAccessToken();
    if (newToken) {
      request.headers.set('Authorization', `Bearer ${newToken}`);
    }
    return fetch(request);
  }

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

let onSessionExpired: (() => void) | null = null;

export function setOnSessionExpired(callback: (() => void) | null) {
  onSessionExpired = callback;
  if (!callback) {
    isLoggingOut = false;
  }
}

export { client };
export * from './client';
export type * from './client/types.gen';

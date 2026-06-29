import { client } from './client/client.gen';
import { classify, pipeline } from './error-mapper';
import { ApiError, UiShowError } from './errors';
import { authControllerRefresh } from './client/sdk.gen';
import { getApiClientBaseUrl } from './api-base';

client.setConfig({
  baseUrl: getApiClientBaseUrl(),
});

if (typeof window !== 'undefined') {
  const token = localStorage.getItem('accessToken');
  if (token) {
    client.setConfig({ auth: token });
  }
}

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

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

export function setTokenCookie(token: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `${TOKEN_COOKIE}=${token};path=/;max-age=86400;samesite=lax`;
  }
}

export function clearTokenCookie() {
  if (typeof window !== 'undefined') {
    document.cookie = `${TOKEN_COOKIE}=;path=/;max-age=0`;
  }
}

export function setRefreshTokenCookie(token: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `${REFRESH_TOKEN_COOKIE}=${token};path=/;max-age=2592000;samesite=lax`;
  }
}

export function clearRefreshTokenCookie() {
  if (typeof window !== 'undefined') {
    document.cookie = `${REFRESH_TOKEN_COOKIE}=;path=/;max-age=0`;
  }
}

export function saveTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  setClientToken(accessToken);
  setTokenCookie(accessToken);
  setRefreshTokenCookie(refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  setClientToken(null);
  clearTokenCookie();
  clearRefreshTokenCookie();
}

let refreshPromise: Promise<boolean> | null = null;

export async function attemptTokenRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await authControllerRefresh({ body: { refreshToken } });
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

function getErrorStatus(error: unknown): number | null {
  if (error instanceof Response) return error.status;
  if (error instanceof ApiError) return error.status ?? null;
  if (typeof error !== 'object' || error === null) return null;

  const status = (error as { status?: unknown; statusCode?: unknown }).status
    ?? (error as { response?: { status?: unknown } }).response?.status
    ?? (error as { statusCode?: unknown }).statusCode;

  return typeof status === 'number' ? status : null;
}

function shouldRetryAfterRefresh(error: unknown) {
  return (error instanceof Response && error.ok) || getErrorStatus(error) === 401;
}

export async function withAuthRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (!shouldRetryAfterRefresh(error)) throw error;

    const refreshed = error instanceof Response && error.ok
      ? true
      : await attemptTokenRefresh();

    if (!refreshed) throw error;
    return operation();
  }
}

function dispatchErrorItems(items: UiShowError[]) {
  if (typeof window !== 'undefined' && items.length > 0) {
    window.dispatchEvent(new CustomEvent('api-error', { detail: items }));
  }
}

client.interceptors.error.use(async (error, response, request) => {
  if (response?.status === 401 && request) {
    const url = new URL(request.url);

    // Chặn refresh loop cho chính endpoint auth
    const isAuthEndpoint = url.pathname.includes('/auth/');

    if (!isAuthEndpoint) {
      if (!refreshPromise) {
        refreshPromise = attemptTokenRefresh().finally(() => { refreshPromise = null; });
      }
      const success = await refreshPromise;
      if (success) {
        const newToken = getAccessToken();
        if (newToken) request.headers.set('Authorization', `Bearer ${newToken}`);
        return fetch(request);
      }
      clearTokens();
      error = new ApiError('SESSION_EXPIRED', 'Session expired. Please log in again.', 401, '/auth/refresh');
    }

    // Biến đổi error thành SESSION_EXPIRED rồi cho pipeline xử lý
  }

  const classified = classify(error, response, request);

  try {
    const { errorItems } = pipeline.process(classified);
    // ADD_TO_ITEMS: dispatch cho toast, không throw UiShowError
    dispatchErrorItems(errorItems);
    return classified;
  } catch (e) {
    if (e instanceof UiShowError) {
      // FINAL_THROW: dispatch + throw để page bắt
      dispatchErrorItems([e]);
      throw e;
    }
    throw e;
  }
});

export { client };
export * from './client';
export type * from './client/types.gen';

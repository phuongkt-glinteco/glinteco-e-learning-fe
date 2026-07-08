import { client } from './client/client.gen';
import { classify, pipeline } from './error-mapper';
import { ApiError, UiShowError, BlockedError } from './errors';
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
export const SUPPRESS_ERROR_TOAST_HEADER = 'x-suppress-error-toast';

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

export const AUTH_COOKIE = 'auth_verified';

export function setAuthCookie(role: string) {
  if (typeof window !== 'undefined') {
    document.cookie = `${AUTH_COOKIE}=${role.toLowerCase()};path=/;max-age=86400;samesite=lax`;
  }
}

export function clearAuthCookie() {
  if (typeof window !== 'undefined') {
    document.cookie = `${AUTH_COOKIE}=;path=/;max-age=0`;
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
  clearAuthCookie();
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
  } catch (err) {
    // Chỉ clear tokens nếu backend thực sự phản hồi từ chối refresh token (lỗi HTTP 4xx như 400, 401, 403, 422)
    // Nếu là lỗi mạng (offline, timeout, CORS) hoặc server lỗi 5xx thì tuyệt đối KHÔNG xoá token của người dùng!
    const classified = classify(err);
    if (classified instanceof ApiError && classified.status && [400, 401, 403, 422].includes(classified.status)) {
      clearTokens();
    }
    return false;
  }
}



let toastDebounceTimer: NodeJS.Timeout | null = null;
let pendingToastItems: UiShowError[] = [];

function dispatchErrorItems(items: UiShowError[], request?: Request) {
  if (typeof window === 'undefined' || items.length === 0) return;

  const shouldSuppressToast = request?.headers.get(SUPPRESS_ERROR_TOAST_HEADER) === 'true';
  const visibleItems = shouldSuppressToast
    ? items.filter((item) => item.errorCode === 'SESSION_EXPIRED')
    : items;

  if (visibleItems.length > 0) {
    for (const item of visibleItems) {
      if (!pendingToastItems.some((ex) => ex.errorCode === item.errorCode && ex.message === item.message)) {
        pendingToastItems.push(item);
      }
    }

    if (!toastDebounceTimer) {
      toastDebounceTimer = setTimeout(() => {
        if (pendingToastItems.length > 0) {
          window.dispatchEvent(new CustomEvent('api-error', { detail: pendingToastItems }));
          pendingToastItems = [];
        }
        toastDebounceTimer = null;
      }, 50);
    }
  }
}

client.interceptors.error.use(async (error, response, request) => {
  if (response && response.ok) {
    return error;
  }

  if (response?.status === 401 && request) {
    const url = new URL(request.url);
    if (url.pathname.includes('/notifications')) {
      // Không xử lý refresh token cho endpoint notifications
      return error;
    }
    // Chặn refresh loop cho chính endpoint auth
    const isAuthEndpoint = url.pathname.includes('/auth/refresh') || url.pathname.includes('/auth/login') || url.pathname.includes('/auth/register');

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
      // Nếu token vẫn còn trong localStorage (nghĩa là refresh thất bại do lỗi mạng/server 5xx chứ không phải do hết hạn thực sự)
      // thì KHÔNG xoá token và KHÔNG biến thành SESSION_EXPIRED
      if (!getRefreshToken()) {
        clearTokens();
        error = new ApiError('SESSION_EXPIRED', 'Session expired. Please log in again.', 401, '/auth/refresh');
      } else {
        error = new BlockedError('NETWORK_ERROR', 'Network error or server unavailable during token refresh.', 0, url.pathname);
      }
    }

    // Biến đổi error thành SESSION_EXPIRED hoặc BlockedError rồi cho pipeline xử lý
  }

  const classified = classify(error, response, request);

  try {
    const { errorItems } = pipeline.process(classified);
    // ADD_TO_ITEMS: dispatch cho toast, không throw UiShowError
    dispatchErrorItems(errorItems, request);
    throw classified;
  } catch (e) {
    if (e instanceof UiShowError) {
      // FINAL_THROW: Tuyệt đối không dispatch cho toast! Chỉ throw để UI form tự bắt và hiển thị
      throw e;
    }
    throw e;
  }
});

export async function clientFetchAll<T extends unknown[]>(
  fns: { [K in keyof T]: () => Promise<T[K]> },
): Promise<T> {
  return Promise.all(fns.map((fn) => fn())) as Promise<T>;
}

import {
  getMockCohortUsersProgress,
  type CohortUsersProgressResponseDto,
  type CohortUserProgressItemDto,
  type CohortUserTrackProgressDto,
  type CohortUserLessonProgressDto,
} from '@/mocks/cohort-users-progress';

export type {
  CohortUsersProgressResponseDto,
  CohortUserProgressItemDto,
  CohortUserTrackProgressDto,
  CohortUserLessonProgressDto,
};

export async function cohortControllerGetUsersProgress(options: {
  path: { id: string };
  query?: { search?: string; page?: number; limit?: number };
  throwOnError?: boolean;
}): Promise<{ data: CohortUsersProgressResponseDto }> {
  return getMockCohortUsersProgress(options.path.id, options.query);
}

export { client };
export * from './client';
export type * from './client/types.gen';


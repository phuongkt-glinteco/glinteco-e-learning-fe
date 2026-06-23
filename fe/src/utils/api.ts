import { API_BASE_URL } from '@/services/api-config';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  statusCode?: number;
  error?: string;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isServer = typeof window === 'undefined';
  const headers = new Headers(options.headers || {});

  if (!isServer) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    if (!isServer) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw {
      statusCode: response.status,
      message: data.message || 'An error occurred',
      error: data.error || 'Bad Request',
    };
  }

  return data as T;
}

type RequestBody = BodyInit | Record<string, unknown> | unknown[] | null;

function serializeBody(body: RequestBody | undefined): BodyInit | undefined {
  if (body === undefined || body === null) return undefined;
  if (
    typeof body === 'string' ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  ) {
    return body;
  }
  return JSON.stringify(body);
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: RequestBody, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: serializeBody(body),
    }),
  put: <T>(path: string, body?: RequestBody, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: serializeBody(body),
    }),
  patch: <T>(path: string, body?: RequestBody, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: serializeBody(body),
    }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: 'DELETE' }),
};

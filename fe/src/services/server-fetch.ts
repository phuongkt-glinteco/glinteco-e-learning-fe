import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient, createConfig } from '@/services/client/client';
import type { Client } from '@/services/client/client';
import { authControllerRefresh } from '@/services/client';
import { classify, pipeline } from '@/services/error-mapper';
import { ApiError, UiShowError } from '@/services/errors';
import { getApiClientBaseUrl } from '@/services/api-base';

export type ServerResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; status?: number } };

async function attemptServerRefresh(refreshTokenValue: string): Promise<string | null> {
  const tempClient = createClient(createConfig({
    baseUrl: getApiClientBaseUrl(),
  }));
  try {
    const res = await authControllerRefresh({
      client: tempClient,
      body: { refreshToken: refreshTokenValue },
      throwOnError: true,
    });
    return res.data?.accessToken ?? null;
  } catch {
    return null;
  }
}

export async function serverFetch<T>(
  fn: (client: Client) => Promise<T>,
): Promise<ServerResult<T>> {
  let refreshTokenValue: string | null = null;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    refreshTokenValue = cookieStore.get('refresh_token')?.value ?? null;

    if (!token) {
      return { success: false, error: { code: 'NO_TOKEN', message: 'Not authenticated' } };
    }

    const serverClient = createClient(createConfig({
      baseUrl: getApiClientBaseUrl(),
      auth: token,
    }));

    const data = await fn(serverClient);
    return { success: true, data };
  } catch (e) {
    const classified = classify(e);

    if (classified instanceof ApiError && classified.status === 401 && refreshTokenValue) {
      const newToken = await attemptServerRefresh(refreshTokenValue);
      if (newToken) {
        const refreshedClient = createClient(createConfig({
          baseUrl: getApiClientBaseUrl(),
          auth: newToken,
        }));
        const data = await fn(refreshedClient);
        return { success: true, data };
      }
      redirect('/auth/logout');
    }

    try {
      pipeline.process(classified);
    } catch (uiError) {
      if (uiError instanceof UiShowError) {
        return { success: false, error: { code: uiError.errorCode, message: uiError.message } };
      }
    }

    if (classified instanceof ApiError) {
      return { success: false, error: { code: classified.code, message: classified.message, status: classified.status } };
    }

    return { success: false, error: { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred.' } };
  }
}

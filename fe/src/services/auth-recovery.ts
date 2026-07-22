import {
  authControllerForgotPassword,
  authControllerResetPassword,
} from '@/services/api-client';

import type { ForgotPasswordResponseDto } from '@/services/client/types.gen';

export async function requestPasswordReset(email: string): Promise<ForgotPasswordResponseDto> {
  const { data } = await authControllerForgotPassword({
    body: { email },
    throwOnError: true,
  });
  return data;
}

export async function resetPassword(input: { token: string; password: string }): Promise<void> {
  await authControllerResetPassword({
    body: input,
    throwOnError: true,
  });
}

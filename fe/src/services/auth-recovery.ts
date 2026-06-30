import {
  authControllerForgotPassword,
  authControllerResetPassword,
} from '@/services/api-client';

export async function requestPasswordReset(email: string): Promise<void> {
  await authControllerForgotPassword({
    body: { email },
    throwOnError: true,
  });
}

export async function resetPassword(input: { token: string; password: string }): Promise<void> {
  await authControllerResetPassword({
    body: input,
    throwOnError: true,
  });
}

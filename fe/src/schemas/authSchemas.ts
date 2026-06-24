import { z } from 'zod';

export const authLoginRequestSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'emailRequired' })
    .email({ message: 'emailInvalid' }),
  password: z
    .string()
    .min(1, { message: 'passwordRequired' })
    .min(6, { message: 'passwordMinLength' }),
  rememberMe: z.boolean(),
});



export const authRegisterRequestSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export const authGoogleRequestSchema = z.object({
  idToken: z.string().min(1, { message: 'ID Token is required' }),
});

export const authRefreshRequestSchema = z.object({
  refreshToken: z.string().min(1, { message: 'Refresh token is required' }),
});

export const authForgotPasswordRequestSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export const authResetPasswordRequestSchema = z.object({
  token: z.string().min(1, { message: 'Reset token is required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export type AuthLoginInput = z.infer<typeof authLoginRequestSchema>;
export type AuthRegisterInput = z.infer<typeof authRegisterRequestSchema>;
export type AuthGoogleInput = z.infer<typeof authGoogleRequestSchema>;
export type AuthRefreshInput = z.infer<typeof authRefreshRequestSchema>;
export type AuthForgotPasswordInput = z.infer<typeof authForgotPasswordRequestSchema>;
export type AuthResetPasswordInput = z.infer<typeof authResetPasswordRequestSchema>;
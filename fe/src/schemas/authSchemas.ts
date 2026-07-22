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
  name: z.string().min(1, { message: 'nameRequired' }),
  email: z
    .string()
    .min(1, { message: 'emailRequired' })
    .email({ message: 'emailInvalid' }),
  password: z
    .string()
    .min(1, { message: 'passwordRequired' })
    .min(6, { message: 'passwordMinLength' }),
});

export const authGoogleRequestSchema = z.object({
  idToken: z.string().min(1, { message: 'ID Token is required' }),
});

export const authRefreshRequestSchema = z.object({
  refreshToken: z.string().min(1, { message: 'Refresh token is required' }),
});

export const authForgotPasswordRequestSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'emailRequired' })
    .email({ message: 'emailInvalid' }),
});

export const authResetPasswordRequestSchema = z.object({
  token: z.string().min(1, { message: 'resetTokenRequired' }),
  password: z
    .string()
    .min(1, { message: 'passwordRequired' })
    .min(6, { message: 'passwordMinLength' }),
});

export const authResetPasswordFormSchema = authResetPasswordRequestSchema
  .extend({
    confirmPassword: z.string().min(1, { message: 'confirmPasswordRequired' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'confirmPasswordMismatch',
    path: ['confirmPassword'],
  });

export type AuthLoginInput = z.infer<typeof authLoginRequestSchema>;
export type AuthRegisterInput = z.infer<typeof authRegisterRequestSchema>;
export type AuthGoogleInput = z.infer<typeof authGoogleRequestSchema>;
export type AuthRefreshInput = z.infer<typeof authRefreshRequestSchema>;
export type AuthForgotPasswordInput = z.infer<typeof authForgotPasswordRequestSchema>;
export type AuthResetPasswordInput = z.infer<typeof authResetPasswordRequestSchema>;
export type AuthResetPasswordFormInput = z.infer<typeof authResetPasswordFormSchema>;

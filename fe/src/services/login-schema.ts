import { z } from 'zod';

/**
 * Zod validation schema for the Login Form.
 * Error messages are set to translation keys (defined in messages/vi.json and messages/en.json)
 * instead of hardcoded raw string messages.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'emailRequired' })
    .email({ message: 'emailInvalid' }),
  password: z
    .string()
    .min(1, { message: 'passwordRequired' })
    .min(6, { message: 'passwordMinLength' }),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

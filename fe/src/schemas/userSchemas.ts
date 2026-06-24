import { z } from 'zod';

export const userRoleSchema = z.enum(['learner', 'admin']);

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
  level: z.number().int().nonnegative(),
  xp: z.number().int().nonnegative(),
  cohortId: z.string().nullable(),
});

export const userSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  level: z.number().int().nonnegative(),
  xp: z.number().int().nonnegative(),
  completion: z.number().int().min(0).max(100),
  avatarHue: z.number().int().min(0).max(360),
});

export const userDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  title: z.string().optional(),
  avatarHue: z.number().int().min(0).max(360),
  level: z.number().int().nonnegative(),
  xp: z.number().int().nonnegative(),
  streakDays: z.number().int().nonnegative(),
  cohortId: z.string().nullable().optional(),
  joinedAt: z.string().datetime(),
});

export const userDashboardStatsSchema = z.object({
  level: z.number().int().nonnegative(),
  xp: z.number().int().nonnegative(),
  xpThisWeek: z.number().int().nonnegative(),
  streakDays: z.number().int().nonnegative(),
  overallCompletion: z.number().int().min(0).max(100),
  tracks: z.object({
    completed: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  }),
  exercises: z.object({
    approved: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
    awaitingReview: z.number().int().nonnegative(),
  }),
  savedDocs: z.object({
    total: z.number().int().nonnegative(),
    unread: z.number().int().nonnegative(),
  }),
});

export const updateUserProfileSchema = z.object({
  title: z.string().min(1, { message: 'Title cannot be empty' }).optional(),
  avatarHue: z.number().int().min(0).max(360, { message: 'Hue must be between 0 and 360' }).optional(),
});

export const slackIntegrationSchema = z.object({
  slackMemberId: z.string().min(1, { message: 'Slack Member ID is required' }),
});

export type User = z.infer<typeof userSchema>;
export type UserSummary = z.infer<typeof userSummarySchema>;
export type UserDetail = z.infer<typeof userDetailSchema>;
export type UserDashboardStats = z.infer<typeof userDashboardStatsSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
export type SlackIntegrationInput = z.infer<typeof slackIntegrationSchema>;

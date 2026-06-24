import { z } from 'zod';

export const notificationTypeSchema = z.enum(['submission_reviewed', 'track_unlocked']);

export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  body: z.string(),
  read: z.boolean(),
  createdAt: z.string().datetime(),
});

export const leaderboardEntrySchema = z.object({
  userId: z.string(),
  name: z.string(),
  level: z.number().int().nonnegative(),
  xp: z.number().int().nonnegative(),
  streakDays: z.number().int().nonnegative(),
  rank: z.number().int().positive(),
});

export type Notification = z.infer<typeof notificationSchema>;
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

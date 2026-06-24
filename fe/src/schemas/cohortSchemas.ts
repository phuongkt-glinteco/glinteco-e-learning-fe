import { z } from 'zod';

export const cohortSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  learnerCount: z.number().int().nonnegative(),
  avgCompletion: z.number().int().min(0).max(100),
});

export const cohortDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  learnerCount: z.number().int().nonnegative(),
  avgCompletion: z.number().int().min(0).max(100),
  avgRampDays: z.number().int().nonnegative(),
  targetRampDays: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});

export const cohortDashboardStatsSchema = z.object({
  activeLearners: z.number().int().nonnegative(),
  newThisWeek: z.number().int().nonnegative(),
  avgCompletion: z.number().int().min(0).max(100),
  avgCompletionDelta: z.number().int(),
  pendingReview: z.number().int().nonnegative(),
  oldestPendingAgo: z.string(),
  avgRampDays: z.number().int().nonnegative(),
  targetRampDays: z.number().int().nonnegative(),
});

export const createCohortSchema = z.object({
  name: z.string().min(1, { message: 'Cohort name is required' }),
  targetRampDays: z.number().int().min(1, { message: 'Target ramp days must be at least 1' }).optional().default(14),
});

export const updateCohortSchema = z.object({
  name: z.string().min(1, { message: 'Cohort name cannot be empty' }).optional(),
  targetRampDays: z.number().int().min(1, { message: 'Target ramp days must be at least 1' }).optional(),
});

export type CohortSummary = z.infer<typeof cohortSummarySchema>;
export type CohortDetail = z.infer<typeof cohortDetailSchema>;
export type CohortDashboardStats = z.infer<typeof cohortDashboardStatsSchema>;
export type CreateCohortInput = z.infer<typeof createCohortSchema>;
export type UpdateCohortInput = z.infer<typeof updateCohortSchema>;

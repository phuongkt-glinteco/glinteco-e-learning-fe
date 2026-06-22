import { z } from 'zod';

export const exerciseDifficultySchema = z.enum(['Beginner', 'Intermediate', 'Advanced']);
export const exerciseStatusSchema = z.enum(['pending', 'submitted', 'approved', 'changes']);

export const exerciseSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  trackId: z.string(),
  track: z.string(),
  tag: z.string(),
  difficulty: exerciseDifficultySchema,
  estimatedTime: z.string(),
  xp: z.number().int().nonnegative(),
  brief: z.string(),
  objectiveCount: z.number().int().nonnegative(),
  status: exerciseStatusSchema,
  prUrl: z.string().nullable(),
});

export const exerciseDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  trackId: z.string(),
  track: z.string(),
  tag: z.string(),
  difficulty: exerciseDifficultySchema,
  estimatedTime: z.string(),
  xp: z.number().int().nonnegative(),
  brief: z.string(),
  overview: z.string(),
  objectives: z.array(z.string()),
  steps: z.array(z.string()),
  resources: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
    })
  ),
  hint: z.string().optional(),
  status: z.string(),
  prUrl: z.string().nullable().optional(),
});

export const createExerciseSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  trackId: z.string().min(1, { message: 'Track ID is required' }),
  tag: z.string().min(1, { message: 'Tag is required' }),
  difficulty: exerciseDifficultySchema,
  estimatedTime: z.string().min(1, { message: 'Estimated time is required' }),
  xp: z.number().int().min(0, { message: 'XP must be a non-negative integer' }),
  brief: z.string().min(1, { message: 'Brief description is required' }),
  overview: z.string().min(1, { message: 'Overview is required' }),
  objectives: z.array(z.string()).min(1, { message: 'At least one objective is required' }),
  steps: z.array(z.string()).min(1, { message: 'At least one step is required' }),
  resourceDocIds: z.array(z.string()).optional().default([]),
  hint: z.string().optional(),
});

export const updateExerciseSchema = z.object({
  xp: z.number().int().min(0, { message: 'XP must be a non-negative integer' }).optional(),
  difficulty: exerciseDifficultySchema.optional(),
});

export type ExerciseSummary = z.infer<typeof exerciseSummarySchema>;
export type ExerciseDetail = z.infer<typeof exerciseDetailSchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;

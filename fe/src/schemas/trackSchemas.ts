import { z } from 'zod';

export const trackStatusSchema = z.enum(['completed', 'in_progress', 'locked']);

export const lessonSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number().int().nonnegative(),
  estimatedTime: z.string(),
});

export const lessonDetailSchema = z.object({
  id: z.string(),
  trackId: z.string(),
  title: z.string(),
  order: z.number().int().nonnegative(),
  estimatedTime: z.string(),
  body: z.string(),
});

export const lessonProgressItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  order: z.number().int().nonnegative(),
  completed: z.boolean(),
});

export const trackSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  estimatedTime: z.string(),
  order: z.number().int().nonnegative(),
  lessonCount: z.number().int().nonnegative(),
  icon: z.string(),
  status: trackStatusSchema,
  lessonsCompleted: z.number().int().nonnegative(),
  description: z.string(),
});

export const trackDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  estimatedTime: z.string(),
  order: z.number().int().nonnegative(),
  icon: z.string(),
  status: trackStatusSchema,
  lessonsCompleted: z.number().int().nonnegative(),
  description: z.string(),
  lessons: z.array(lessonProgressItemSchema),
});

export const createTrackSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  estimatedTime: z.string().min(1, { message: 'Estimated time is required' }),
  lessonCount: z.number().int().min(0, { message: 'Lesson count must be at least 0' }),
  afterTrackId: z.string().optional(),
});

export const reorderTracksSchema = z.object({
  order: z.array(z.string()).min(1, { message: 'Order list cannot be empty' }),
});

export const updateTrackSchema = z.object({
  title: z.string().min(1, { message: 'Title cannot be empty' }).optional(),
  description: z.string().min(1, { message: 'Description cannot be empty' }).optional(),
  estimatedTime: z.string().min(1, { message: 'Estimated time cannot be empty' }).optional(),
  icon: z.string().min(1, { message: 'Icon cannot be empty' }).optional(),
});

export const createLessonSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  order: z.number().int().min(1, { message: 'Order must be at least 1' }),
  estimatedTime: z.string().min(1, { message: 'Estimated time is required' }),
  body: z.string().min(1, { message: 'Body content is required' }),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1, { message: 'Title cannot be empty' }).optional(),
  body: z.string().min(1, { message: 'Body content cannot be empty' }).optional(),
  estimatedTime: z.string().min(1, { message: 'Estimated time cannot be empty' }).optional(),
});

export type LessonSummary = z.infer<typeof lessonSummarySchema>;
export type LessonDetail = z.infer<typeof lessonDetailSchema>;
export type LessonProgressItem = z.infer<typeof lessonProgressItemSchema>;
export type TrackSummary = z.infer<typeof trackSummarySchema>;
export type TrackDetail = z.infer<typeof trackDetailSchema>;
export type CreateTrackInput = z.infer<typeof createTrackSchema>;
export type ReorderTracksInput = z.infer<typeof reorderTracksSchema>;
export type UpdateTrackInput = z.infer<typeof updateTrackSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

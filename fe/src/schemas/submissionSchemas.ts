import { z } from 'zod';

export const submissionStatusSchema = z.enum(['submitted', 'approved', 'changes']);

export const submissionSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  userId: z.string(),
  prUrl: z.string(),
  status: submissionStatusSchema,
  submittedAt: z.string().datetime(),
});

export const submissionFeedItemSchema = z.object({
  id: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    avatarHue: z.number().int().min(0).max(360),
  }),
  exercise: z.string(),
  prUrl: z.string(),
  status: z.string(),
  submittedAt: z.string().datetime(),
});

export const submissionDetailSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  exercise: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
  }),
  prUrl: z.string(),
  status: z.string(),
  reviewerId: z.string().nullable(),
  reviewNote: z.string().nullable(),
  submittedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().nullable(),
});

export const submissionHistoryItemSchema = z.object({
  id: z.string(),
  prUrl: z.string(),
  status: submissionStatusSchema,
  submittedAt: z.string().datetime(),
  reviewerId: z.string().nullable(),
  reviewNote: z.string().nullable(),
  reviewedAt: z.string().datetime().nullable(),
});

export const submissionHistoryResponseSchema = z.object({
  submissionId: z.string(),
  exerciseId: z.string(),
  history: z.array(submissionHistoryItemSchema),
});

export const submitExerciseSchema = z.object({
  prUrl: z.string().url({ message: 'Invalid URL. Please enter a valid Pull Request link' }),
});

export const updateSubmissionSchema = z.object({
  prUrl: z.string().url({ message: 'Invalid URL. Please enter a valid Pull Request link' }),
});

export const approveSubmissionSchema = z.object({
  note: z.string().optional(),
});

export const requestChangesSubmissionSchema = z.object({
  note: z.string().min(1, { message: 'Review note is required to request changes' }),
});

export type Submission = z.infer<typeof submissionSchema>;
export type SubmissionFeedItem = z.infer<typeof submissionFeedItemSchema>;
export type SubmissionDetail = z.infer<typeof submissionDetailSchema>;
export type SubmissionHistoryItem = z.infer<typeof submissionHistoryItemSchema>;
export type SubmissionHistoryResponse = z.infer<typeof submissionHistoryResponseSchema>;
export type SubmitExerciseInput = z.infer<typeof submitExerciseSchema>;
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;
export type ApproveSubmissionInput = z.infer<typeof approveSubmissionSchema>;
export type RequestChangesSubmissionInput = z.infer<typeof requestChangesSubmissionSchema>;

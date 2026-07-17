import { z } from 'zod';

export const exerciseDifficultySchema = z.enum(['Beginner', 'Intermediate', 'Advanced']);
export const exerciseStatusSchema = z.enum(['pending', 'submitted', 'approved', 'changes']);
export const exerciseTypeSchema = z.enum(['PR_REVIEW', 'QUIZ', 'FILL_IN_BLANK']);

const exerciseQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string().min(1, { message: 'questionPromptRequired' }),
  options: z.array(z.string()).optional().default([]),
  correctAnswer: z.string().min(1, { message: 'questionAnswerRequired' }),
  explanation: z.string().min(1, { message: 'questionExplanationRequired' }),
});

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
  type: exerciseTypeSchema.default('PR_REVIEW'),
  questionsData: z.array(exerciseQuestionSchema).optional().default([]),
  targetScore: z.number().int().min(0).max(100).optional(),
  isMandatory: z.boolean().default(true),
});

export const createExerciseFormSchema = z.object({
  title: z.string().min(1, { message: 'titleRequired' }),
  tag: z.string().min(1, { message: 'tagRequired' }),
  difficulty: exerciseDifficultySchema,
  estimatedTime: z.string().min(1, { message: 'estimatedTimeRequired' }),
  xp: z.string().min(1, { message: 'xpRequired' }),
  brief: z.string().min(1, { message: 'briefRequired' }),
  overview: z.string().min(1, { message: 'overviewRequired' }),
  objectives: z.array(z.string()).min(1, { message: 'objectivesMin' }),
  steps: z.array(z.string()).min(1, { message: 'stepsMin' }),
  resourceDocIds: z.array(z.string()).default([]),
  hint: z.string().optional(),
  type: exerciseTypeSchema.default('PR_REVIEW'),
  questionsData: z.array(exerciseQuestionSchema).default([]),
  targetScore: z.string().default('100'),
  isMandatory: z.boolean().default(true),
}).superRefine((value, ctx) => {
  if (value.type === 'PR_REVIEW') return;

  if (value.questionsData.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'questionsMin',
      path: ['questionsData'],
    });
  }

  if (!/^(?:0|[1-9]\d?|100)$/.test(value.targetScore.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'targetScoreInvalid',
      path: ['targetScore'],
    });
  }

  value.questionsData.forEach((question, questionIndex) => {
    if (value.type === 'QUIZ') {
      const options = question.options ?? [];
      const trimmedOptions = options.map((option) => option.trim());
      if (trimmedOptions.length !== 4 || trimmedOptions.some((option) => !option)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'quizOptionsExact',
          path: ['questionsData', questionIndex, 'options'],
        });
      }

      if (new Set(trimmedOptions).size !== trimmedOptions.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'quizOptionsUnique',
          path: ['questionsData', questionIndex, 'options'],
        });
      }

      if (question.correctAnswer.trim() && !trimmedOptions.includes(question.correctAnswer.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'quizCorrectAnswerInvalid',
          path: ['questionsData', questionIndex, 'correctAnswer'],
        });
      }
    }
  });

  const ids = value.questionsData.map((question) => question.id.trim());
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'questionIdsUnique',
      path: ['questionsData'],
    });
  }
});

export const updateExerciseSchema = z.object({
  xp: z.number().int().min(0, { message: 'XP must be a non-negative integer' }).optional(),
  difficulty: exerciseDifficultySchema.optional(),
});

export type ExerciseSummary = z.infer<typeof exerciseSummarySchema>;
export type ExerciseDetail = z.infer<typeof exerciseDetailSchema>;
export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type CreateExerciseFormInput = z.infer<typeof createExerciseFormSchema>;
export type UpdateExerciseInput = z.infer<typeof updateExerciseSchema>;

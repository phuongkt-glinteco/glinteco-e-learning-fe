import type { TrackSummaryDto } from '@/services/api-client';

export type TrackStatus = NonNullable<TrackSummaryDto['status']>;
export type CourseAccessStatus = 'unlocked' | 'locked';
export type LessonType = 'video' | 'reading' | 'quiz' | 'coding' | 'assignment';

export interface LearnerTrack {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  lessonCount: number;
  lessonsCompleted: number;
  order: number;
  status: TrackStatus;
  icon?: string;
  accessStatus: CourseAccessStatus;
  lockedReason: string | null;
  currentLessonId: string | null;
  level: string;
  thumbnail: string | null;
  nextTrack?: { id?: string; title?: string } | null;
}

export interface LearnerLesson {
  id: string;
  title: string;
  body: string;
  description: string;
  estimatedTime: string;
  order: number;
  completed: boolean;
  xp: number;
  type: LessonType;
}

export interface TrackLessonPreview {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  order: number;
  completed: boolean;
  type: LessonType;
}

export interface LearnerExercise {
  id: string;
  lessonId: string | null;
  trackId: string | null;
  trackTitle: string;
  title: string;
  brief: string;
  difficulty: string;
  estimatedTime: string;
  xp: number;
  status: LearnerSubmissionStatus;
  tag: string;
  prUrl: string | null;
}

export type LearnerSubmissionStatus =
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'changes'
  | 'approved'
  | 'rejected';

export interface LearnerExerciseResource {
  id: string;
  title: string;
  kind: string;
  content: string | null;
  url: string | null;
}

export interface LearnerSubmissionState {
  id: string | null;
  status: LearnerSubmissionStatus;
  prUrl: string | null;
  reviewNote: string | null;
  reviewerId: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  canSubmit: boolean;
  canResubmit: boolean;
}

export type LearnerSubmissionHistoryEventType = 'submission' | 'review';

export interface LearnerSubmissionHistoryItem {
  id: string;
  eventType: LearnerSubmissionHistoryEventType;
  prUrl: string | null;
  status: LearnerSubmissionStatus;
  submittedAt: string | null;
  reviewerId: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
}

export interface LearnerSubmissionFormValues {
  prUrl: string;
}

export interface LearnerExerciseDetail extends LearnerExercise {
  overview: string;
  objectives: string[];
  steps: string[];
  resources: LearnerExerciseResource[];
  hint: string | null;
}

export interface LearnerExerciseFeedItem extends LearnerExercise {
  submissionId: string | null;
  reviewNote: string | null;
  reviewerName: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

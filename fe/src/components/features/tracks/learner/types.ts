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
  title: string;
  brief: string;
  difficulty: string;
  estimatedTime: string;
  xp: number;
  status: string;
  tag: string;
  prUrl: string | null;
}

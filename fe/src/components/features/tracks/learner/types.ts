import type { TrackSummary } from '@/services/api-client';

export type TrackStatus = NonNullable<TrackSummary['status']>;

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
}

export interface LearnerLesson {
  id: string;
  title: string;
  body: string;
  bodySource: 'api' | 'fallback' | 'mock';
  estimatedTime: string;
  order: number;
  completed: boolean;
  xp: number;
}

export interface TrackLessonPreview {
  id: string;
  title: string;
  estimatedTime: string;
  order: number;
  completed: boolean;
}

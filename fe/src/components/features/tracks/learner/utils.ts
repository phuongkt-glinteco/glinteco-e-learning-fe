import type {
  LessonProgressItem,
  LessonSummary,
  TrackDetail,
  TrackSummary,
} from '@/services/api-client';
import { normalizeTrackIcon } from '@/utils/track-icons';
import type {
  LearnerLesson,
  LearnerTrack,
  TrackLessonPreview,
  TrackStatus,
} from './types';

export const DEFAULT_STATUS: TrackStatus = 'locked';

// Fallback XP khi API không trả về xpAwarded. Sẽ bị override bởi response.data.xpAwarded.
export const DEFAULT_LESSON_XP = 40;

export function getRouteParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

export function normalizeTrackSummary(track: TrackSummary, index: number): LearnerTrack | null {
  if (!track.id) return null;

  return {
    id: track.id,
    title: track.title?.trim() || 'Untitled track',
    description: track.description?.trim() || 'Track details are being prepared.',
    estimatedTime: track.estimatedTime?.trim() || 'TBD',
    lessonCount: track.lessonCount ?? 0,
    lessonsCompleted: track.lessonsCompleted ?? 0,
    order: track.order ?? index + 1,
    status: track.status ?? DEFAULT_STATUS,
    icon: normalizeTrackIcon(track.icon),
  };
}

export function normalizeTrackSummaries(tracks: TrackSummary[]): LearnerTrack[] {
  return tracks
    .map(normalizeTrackSummary)
    .filter((track): track is LearnerTrack => Boolean(track))
    .sort((a, b) => a.order - b.order);
}

export function normalizeTrackDetail(
  track: TrackDetail,
  trackId: string,
  lessons: TrackLessonPreview[]
): LearnerTrack {
  const lessonCount = lessons.length;
  const lessonsCompleted = track.lessonsCompleted
    ?? lessons.filter((lesson) => lesson.completed).length;

  return {
    id: track.id ?? trackId,
    title: track.title?.trim() || 'Untitled track',
    description: track.description?.trim() || 'Track details are being prepared.',
    estimatedTime: track.estimatedTime?.trim() || 'TBD',
    lessonCount,
    lessonsCompleted,
    order: track.order ?? 1,
    status: track.status ?? DEFAULT_STATUS,
    icon: normalizeTrackIcon(track.icon),
  };
}

export function normalizeTrackDetailWithCount(
  track: TrackDetail,
  trackId: string,
  lessonCountFallback: number
): LearnerTrack {
  const lessonCount = track.lessons?.length ?? lessonCountFallback;

  return {
    id: track.id ?? trackId,
    title: track.title?.trim() || 'Untitled track',
    description: track.description?.trim() || 'Track details are being prepared.',
    estimatedTime: track.estimatedTime?.trim() || 'TBD',
    lessonCount,
    lessonsCompleted: track.lessonsCompleted ?? 0,
    order: track.order ?? 1,
    status: track.status ?? DEFAULT_STATUS,
    icon: normalizeTrackIcon(track.icon),
  };
}

export function normalizeLessonPreview(
  lesson: LessonSummary,
  index: number,
  progressLesson?: LessonProgressItem
): TrackLessonPreview | null {
  const id = progressLesson?.id ?? lesson.id;
  if (!id) return null;

  return {
    id,
    title: lesson.title?.trim() || progressLesson?.title?.trim() || 'Untitled lesson',
    estimatedTime: lesson.estimatedTime?.trim() || 'TBD',
    order: lesson.order ?? progressLesson?.order ?? index + 1,
    completed: progressLesson?.completed ?? false,
  };
}

export function normalizeLessonsPreview(
  lessons: LessonSummary[],
  progressLessons: LessonProgressItem[]
): TrackLessonPreview[] {
  const lessonById = new Map(
    lessons
      .filter((lesson): lesson is LessonSummary & { id: string } => Boolean(lesson.id))
      .map((lesson) => [lesson.id, lesson])
  );

  const source = progressLessons.length > 0
    ? progressLessons.map((progressLesson, index) => ({
        lesson: lessonById.get(progressLesson.id ?? '') ?? ({} as LessonSummary),
        progress: progressLesson,
        index,
      }))
    : lessons.map((lesson, index) => ({ lesson, progress: undefined, index }));

  return source
    .map(({ lesson, progress, index }) => normalizeLessonPreview(lesson, index, progress))
    .filter((lesson): lesson is TrackLessonPreview => Boolean(lesson))
    .sort((a, b) => a.order - b.order);
}

// body: '' — API hiện chưa trả lesson body. View sẽ render empty state "Lesson content is not available yet".
export function normalizeLessons(
  apiLessons: LessonSummary[],
  progressLessons: LessonProgressItem[]
): LearnerLesson[] {
  return normalizeLessonsPreview(apiLessons, progressLessons)
    .map((lesson) => ({ ...lesson, body: '', xp: DEFAULT_LESSON_XP }));
}

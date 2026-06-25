import type {
  ErrorResponse,
  ExerciseSummary,
  LessonDetail,
  LessonProgressItem,
  LessonSummary,
  TrackDetail,
  TrackSummary,
} from '@/services/api-client';
import { normalizeTrackIcon } from '@/utils/track-icons';
import type {
  LearnerLesson,
  LearnerExercise,
  LearnerTrack,
  LessonType,
  TrackLessonPreview,
  TrackStatus,
} from './types';

export const DEFAULT_STATUS: TrackStatus = 'locked';
export const DEFAULT_LESSON_TYPE: LessonType = 'reading';

// Fallback XP when the complete-lesson response omits xpAwarded.
export const DEFAULT_LESSON_XP = 40;

export type ApiListResponse<T> = T[] | { data?: T[] | null } | null | undefined;

type NullableUnknown = unknown | null | undefined;

type TrackContractExtras = {
  accessStatus?: 'unlocked' | 'locked';
  lockedReason?: NullableUnknown;
  currentLessonId?: NullableUnknown;
  level?: string | null;
  thumbnail?: NullableUnknown;
};

type LessonContractExtras = {
  description?: string | null;
  type?: LessonType | null;
  completed?: boolean | null;
};

export type TrackSummaryContract = TrackSummary & TrackContractExtras;
export type TrackDetailContract = TrackDetail & TrackContractExtras & {
  lessons?: Array<LessonProgressItem & LessonContractExtras>;
};
export type LessonSummaryContract = LessonSummary & LessonContractExtras;
export type LessonProgressContract = LessonProgressItem & LessonContractExtras;
export type LessonDetailContract = LessonDetail & LessonContractExtras & {
  relatedDocs?: unknown[];
};
export type ExerciseSummaryContract = ExerciseSummary & {
  lessonId?: string | null;
};

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

export function getErrorStatus(error: unknown): number | null {
  if (typeof error !== 'object' || error === null) return null;

  const maybeStatus = (error as { status?: unknown; statusCode?: unknown }).status
    ?? (error as { response?: { status?: unknown } }).response?.status
    ?? (error as ErrorResponse).statusCode;

  return typeof maybeStatus === 'number' ? maybeStatus : null;
}

export function extractDataArray<T>(response: ApiListResponse<T>): T[] {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
}

function normalizeNullableString(value: NullableUnknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }
  return null;
}

function normalizeLockedReason(value: NullableUnknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value !== 'object' || value === null) return null;

  const reason = value as {
    message?: unknown;
    reason?: unknown;
    title?: unknown;
  };

  return normalizeNullableString(reason.message)
    ?? normalizeNullableString(reason.reason)
    ?? normalizeNullableString(reason.title);
}

function normalizeThumbnail(value: NullableUnknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value !== 'object' || value === null) return null;

  const thumbnail = value as { url?: unknown; src?: unknown };
  return normalizeNullableString(thumbnail.url) ?? normalizeNullableString(thumbnail.src);
}

function normalizeLessonType(value: LessonType | null | undefined): LessonType {
  return value ?? DEFAULT_LESSON_TYPE;
}

export function normalizeTrackSummary(track: TrackSummaryContract, index: number): LearnerTrack | null {
  if (!track.id) return null;
  const accessStatus = track.accessStatus ?? (track.status === 'locked' ? 'locked' : 'unlocked');

  return {
    id: track.id,
    title: track.title?.trim() || 'Untitled track',
    description: track.description?.trim() || 'Track details are being prepared.',
    estimatedTime: track.estimatedTime?.trim() || 'TBD',
    lessonCount: track.lessonCount ?? 0,
    lessonsCompleted: track.lessonsCompleted ?? 0,
    order: track.order ?? index + 1,
    status: accessStatus === 'locked' ? 'locked' : (track.status ?? DEFAULT_STATUS),
    icon: normalizeTrackIcon(track.icon),
    accessStatus,
    lockedReason: normalizeLockedReason(track.lockedReason),
    currentLessonId: normalizeNullableString(track.currentLessonId),
    level: track.level?.trim() || 'General',
    thumbnail: normalizeThumbnail(track.thumbnail),
  };
}

export function normalizeTrackSummaries(tracks: TrackSummaryContract[]): LearnerTrack[] {
  return tracks
    .map(normalizeTrackSummary)
    .filter((track): track is LearnerTrack => Boolean(track))
    .sort((a, b) => a.order - b.order);
}

export function normalizeTrackDetail(
  track: TrackDetailContract,
  trackId: string,
  lessons: TrackLessonPreview[]
): LearnerTrack {
  const lessonCount = lessons.length;
  const lessonsCompleted = track.lessonsCompleted
    ?? lessons.filter((lesson) => lesson.completed).length;
  const accessStatus = track.accessStatus ?? (track.status === 'locked' ? 'locked' : 'unlocked');

  return {
    id: track.id ?? trackId,
    title: track.title?.trim() || 'Untitled track',
    description: track.description?.trim() || 'Track details are being prepared.',
    estimatedTime: track.estimatedTime?.trim() || 'TBD',
    lessonCount,
    lessonsCompleted,
    order: track.order ?? 1,
    status: accessStatus === 'locked' ? 'locked' : (track.status ?? DEFAULT_STATUS),
    icon: normalizeTrackIcon(track.icon),
    accessStatus,
    lockedReason: normalizeLockedReason(track.lockedReason),
    currentLessonId: normalizeNullableString(track.currentLessonId),
    level: track.level?.trim() || 'General',
    thumbnail: normalizeThumbnail(track.thumbnail),
  };
}

export function normalizeTrackDetailWithCount(
  track: TrackDetailContract,
  trackId: string,
  lessonCountFallback: number
): LearnerTrack {
  const progressLessons = track.lessons ?? [];
  const lessonCount = progressLessons.length > 0
    ? progressLessons.length
    : lessonCountFallback;
  const lessonsCompleted = track.lessonsCompleted
    ?? progressLessons.filter((lesson) => lesson.completed).length;
  const accessStatus = track.accessStatus ?? (track.status === 'locked' ? 'locked' : 'unlocked');

  return {
    id: track.id ?? trackId,
    title: track.title?.trim() || 'Untitled track',
    description: track.description?.trim() || 'Track details are being prepared.',
    estimatedTime: track.estimatedTime?.trim() || 'TBD',
    lessonCount,
    lessonsCompleted,
    order: track.order ?? 1,
    status: accessStatus === 'locked' ? 'locked' : (track.status ?? DEFAULT_STATUS),
    icon: normalizeTrackIcon(track.icon),
    accessStatus,
    lockedReason: normalizeLockedReason(track.lockedReason),
    currentLessonId: normalizeNullableString(track.currentLessonId),
    level: track.level?.trim() || 'General',
    thumbnail: normalizeThumbnail(track.thumbnail),
  };
}

export function normalizeLessonPreview(
  lesson: LessonSummaryContract | undefined,
  index: number,
  progressLesson?: LessonProgressContract
): TrackLessonPreview | null {
  const id = progressLesson?.id ?? lesson?.id;
  if (!id) return null;

  return {
    id,
    title: lesson?.title?.trim() || progressLesson?.title?.trim() || 'Untitled lesson',
    description: lesson?.description?.trim() || progressLesson?.description?.trim() || '',
    estimatedTime: lesson?.estimatedTime?.trim() || 'TBD',
    order: lesson?.order ?? progressLesson?.order ?? index + 1,
    completed: lesson?.completed ?? progressLesson?.completed ?? false,
    type: normalizeLessonType(lesson?.type ?? progressLesson?.type),
  };
}

export function normalizeLessonsPreview(
  lessons: LessonSummaryContract[],
  progressLessons: LessonProgressContract[]
): TrackLessonPreview[] {
  const lessonById = new Map(
    lessons
      .filter((lesson): lesson is LessonSummaryContract & { id: string } => Boolean(lesson.id))
      .map((lesson) => [lesson.id, lesson])
  );

  const source = progressLessons.length > 0
    ? progressLessons.map((progressLesson, index) => ({
        lesson: lessonById.get(progressLesson.id ?? ''),
        progress: progressLesson,
        index,
      }))
    : lessons.map((lesson, index) => ({ lesson, progress: undefined, index }));

  return source
    .map(({ lesson, progress, index }) => normalizeLessonPreview(lesson, index, progress))
    .filter((lesson): lesson is TrackLessonPreview => Boolean(lesson))
    .sort((a, b) => a.order - b.order);
}

export function normalizeLessons(
  apiLessons: LessonSummaryContract[],
  progressLessons: LessonProgressContract[]
): LearnerLesson[] {
  return normalizeLessonsPreview(apiLessons, progressLessons)
    .map((lesson) => ({
      ...lesson,
      body: '',
      description: lesson.description,
      xp: DEFAULT_LESSON_XP,
    }));
}

export function normalizeLessonDetail(
  detail: LessonDetailContract | null | undefined,
  fallback: TrackLessonPreview
): LearnerLesson {
  return {
    id: detail?.id ?? fallback.id,
    title: detail?.title?.trim() || fallback.title,
    body: detail?.body?.trim() || '',
    description: detail?.description?.trim() || fallback.description,
    estimatedTime: detail?.estimatedTime?.trim() || fallback.estimatedTime,
    order: detail?.order ?? fallback.order,
    completed: detail?.completed ?? fallback.completed,
    xp: DEFAULT_LESSON_XP,
    type: normalizeLessonType(detail?.type ?? fallback.type),
  };
}

export function normalizeExerciseSummary(exercise: ExerciseSummaryContract): LearnerExercise | null {
  if (!exercise.id) return null;

  return {
    id: exercise.id,
    title: exercise.title?.trim() || 'Untitled exercise',
    brief: exercise.brief?.trim() || 'Exercise details are being prepared.',
    difficulty: exercise.difficulty ?? 'Beginner',
    estimatedTime: exercise.estimatedTime?.trim() || 'TBD',
    xp: exercise.xp ?? 0,
    status: exercise.status ?? 'pending',
    tag: exercise.tag?.trim() || 'Practice',
    prUrl: exercise.prUrl ?? null,
  };
}

export function normalizeExerciseSummaries(exercises: ExerciseSummaryContract[]): LearnerExercise[] {
  return exercises
    .map(normalizeExerciseSummary)
    .filter((exercise): exercise is LearnerExercise => Boolean(exercise));
}

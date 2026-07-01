import type {
  DocumentResponseDto,
  ExerciseDetailDto,
  ExerciseSummaryDto,
  LessonDetailDto,
  LessonProgressItemDto,
  SubmissionDetailDto,
  SubmissionFeedItemDto,
  TrackDetailDto,
  TrackSummaryDto,
} from '@/services/api-client';
import { normalizeTrackIcon } from '@/utils/track-icons';
import { isUiShowError } from '@/services/errors';
import type {
  LearnerLesson,
  LearnerExercise,
  LearnerExerciseFeedItem,
  LearnerExerciseDetail,
  LearnerExerciseResource,
  LearnerSubmissionState,
  LearnerSubmissionStatus,
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
  estimatedTime?: string | null;
  body?: string | null;
};

type ErrorResponseLike = {
  statusCode?: number;
};

type FlexibleTrackFields = 'accessStatus' | 'lockedReason' | 'currentLessonId' | 'level' | 'thumbnail';
type OptionalTrackDetailFields = 'prevTrack' | 'nextTrack';

export type TrackSummaryContract = Omit<TrackSummaryDto, FlexibleTrackFields> & TrackContractExtras;
export type TrackDetailContract = Omit<TrackDetailDto, FlexibleTrackFields | OptionalTrackDetailFields | 'lessons'> & TrackContractExtras & {
  lessons?: Array<LessonProgressItemDto & LessonContractExtras>;
  prevTrack?: unknown;
  nextTrack?: unknown;
};
export type LessonSummaryContract = LessonProgressItemDto & LessonContractExtras;
export type LessonProgressContract = LessonProgressItemDto & LessonContractExtras;
export type LessonDetailContract = LessonDetailDto & LessonContractExtras & {
  relatedDocs?: unknown[];
};
export type ExerciseSummaryContract = Partial<Omit<ExerciseSummaryDto, 'lessonId' | 'prUrl' | 'status'>> & {
  lessonId?: unknown;
  prUrl?: unknown;
  status?: unknown;
};
export type ExerciseDetailContract = Omit<ExerciseDetailDto, 'lessonId' | 'prUrl' | 'objectives' | 'steps' | 'resources' | 'status'> & {
  lessonId?: unknown;
  prUrl?: unknown;
  objectives?: unknown;
  steps?: unknown;
  resources?: unknown;
  status?: unknown;
};
export type SubmissionDetailContract = Omit<
  SubmissionDetailDto,
  'prUrl' | 'reviewNote' | 'reviewerId' | 'reviewedAt' | 'submittedAt' | 'status'
> & {
  prUrl?: unknown;
  reviewNote?: unknown;
  reviewerId?: unknown;
  reviewedAt?: unknown;
  submittedAt?: unknown;
  status?: unknown;
};
export type SubmissionFeedItemContract = Omit<SubmissionFeedItemDto, 'prUrl' | 'status' | 'submittedAt' | 'exercise'> & {
  prUrl?: unknown;
  status?: unknown;
  submittedAt?: unknown;
  exercise?: unknown;
};

export function getRouteParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export function getLearnerRouteBase(trackId: string | string[] | undefined) {
  return getRouteParam(trackId) ? 'tracks' : 'courses';
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (isUiShowError(error)) {
    return fallback;
  }
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
    ?? (error as ErrorResponseLike).statusCode;

  return typeof maybeStatus === 'number' ? maybeStatus : null;
}

export function extractDataArray<T>(response: ApiListResponse<T>): T[] {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
}

export function getContinueLessonId(
  lessons: TrackLessonPreview[],
  currentLessonId: string | null | undefined
): string | null {
  if (lessons.length === 0) return null;

  const firstIncompleteLesson = lessons.find((lesson) => !lesson.completed);
  if (!firstIncompleteLesson) return null;
  if (!currentLessonId) return firstIncompleteLesson.id;

  const currentLessonIndex = lessons.findIndex((lesson) => lesson.id === currentLessonId);
  if (currentLessonIndex < 0) return firstIncompleteLesson.id;

  const currentLesson = lessons[currentLessonIndex];
  if (!currentLesson.completed) return currentLesson.id;

  const nextIncompleteLesson = lessons
    .slice(currentLessonIndex + 1)
    .find((lesson) => !lesson.completed);

  return nextIncompleteLesson?.id ?? firstIncompleteLesson.id;
}

export function getAdjacentLessonIds(
  lessons: Array<Pick<TrackLessonPreview, 'id'>>,
  activeLessonId: string
) {
  const activeLessonIndex = lessons.findIndex((lesson) => lesson.id === activeLessonId);

  return {
    previousLessonId: activeLessonIndex > 0
      ? lessons[activeLessonIndex - 1]?.id ?? null
      : null,
    nextLessonId: activeLessonIndex >= 0
      ? lessons[activeLessonIndex + 1]?.id ?? null
      : null,
  };
}

export function normalizeNullableString(value: NullableUnknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }
  return null;
}

function normalizeStringFromObject(value: NullableUnknown, keys: string[]): string | null {
  if (typeof value !== 'object' || value === null) return null;

  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const normalized = normalizeNullableString(record[key]);
    if (normalized) return normalized;
  }

  return null;
}

function normalizeStringFromFlexibleValue(value: NullableUnknown, keys: string[]): string | null {
  return normalizeNullableString(value) ?? normalizeStringFromObject(value, keys);
}

export function normalizeLessonId(value: NullableUnknown): string | null {
  return normalizeNullableString(value)
    ?? normalizeStringFromObject(value, ['id', 'lessonId', 'uuid']);
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

function normalizeTag(value: NullableUnknown): string {
  if (typeof value === 'string') return value.trim() || 'Practice';
  if (typeof value !== 'object' || value === null) return 'Practice';

  const tag = value as { name?: unknown; title?: unknown; id?: unknown };
  return normalizeNullableString(tag.name)
    ?? normalizeNullableString(tag.title)
    ?? normalizeNullableString(tag.id)
    ?? 'Practice';
}

export function normalizeUrl(value: NullableUnknown): string | null {
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value !== 'object' || value === null) return null;

  const link = value as { url?: unknown; href?: unknown; prUrl?: unknown };
  return normalizeNullableString(link.url)
    ?? normalizeNullableString(link.href)
    ?? normalizeNullableString(link.prUrl);
}

function normalizeTextList(value: NullableUnknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value !== 'object' || value === null) return [];

  const record = value as Record<string, unknown>;
  const nested = record.data ?? record.items;
  if (Array.isArray(nested)) return normalizeTextList(nested);

  return Object.values(record)
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSubmissionStatus(value: NullableUnknown): LearnerSubmissionStatus {
  const status = normalizeNullableString(value);
  if (
    status === 'in_progress'
    || status === 'submitted'
    || status === 'changes'
    || status === 'changes_requested'
    || status === 'approved'
    || status === 'rejected'
  ) {
    if (status === 'changes_requested') return 'changes';
    return status;
  }
  return 'pending';
}

function normalizeResource(resource: unknown): LearnerExerciseResource | null {
  if (typeof resource !== 'object' || resource === null) return null;

  const doc = resource as Partial<DocumentResponseDto> & Record<string, unknown>;
  const id = normalizeNullableString(doc.id);
  if (!id) return null;

  return {
    id,
    title: normalizeNullableString(doc.title) ?? 'Untitled resource',
    kind: normalizeNullableString(doc.kind) ?? 'Document',
    content: normalizeStringFromFlexibleValue(doc.content, ['content', 'body', 'summary', 'description', 'text']),
    url: normalizeUrl(doc.url ?? doc.href),
  };
}

export function normalizeExerciseResources(value: NullableUnknown): LearnerExerciseResource[] {
  return Array.isArray(value)
    ? value.map(normalizeResource).filter((resource): resource is LearnerExerciseResource => Boolean(resource))
    : [];
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

function extractNextTrack(track: unknown): { id?: string; title?: string } | null {
  if (track && typeof track === 'object') {
    const obj = track as Record<string, unknown>;
    const id = typeof obj.id === 'string' ? obj.id : undefined;
    const title = typeof obj.title === 'string' ? obj.title : undefined;
    if (id || title) return { id, title };
  }
  return null;
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
    nextTrack: extractNextTrack(track.nextTrack),
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
    nextTrack: extractNextTrack(track.nextTrack),
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
    lessonId: normalizeLessonId(exercise.lessonId),
    trackId: normalizeNullableString(exercise.trackId),
    trackTitle: exercise.track?.trim() || 'Course',
    title: exercise.title?.trim() || 'Untitled exercise',
    brief: exercise.brief?.trim() || 'Exercise details are being prepared.',
    difficulty: exercise.difficulty ?? 'Beginner',
    estimatedTime: exercise.estimatedTime?.trim() || 'TBD',
    xp: exercise.xp ?? 0,
    status: normalizeSubmissionStatus(exercise.status),
    tag: normalizeTag(exercise.tag),
    prUrl: normalizeUrl(exercise.prUrl),
  };
}

export function normalizeExerciseSummaries(exercises: ExerciseSummaryContract[]): LearnerExercise[] {
  return exercises
    .map(normalizeExerciseSummary)
    .filter((exercise): exercise is LearnerExercise => Boolean(exercise));
}

export function normalizeExerciseDetail(exercise: ExerciseDetailContract): LearnerExerciseDetail | null {
  const summary = normalizeExerciseSummary(exercise);
  if (!summary) return null;

  return {
    ...summary,
    trackId: normalizeNullableString(exercise.trackId),
    trackTitle: exercise.track?.trim() || 'Course',
    overview: exercise.overview?.trim() || '',
    objectives: normalizeTextList(exercise.objectives),
    steps: normalizeTextList(exercise.steps),
    resources: normalizeExerciseResources(exercise.resources),
    hint: normalizeNullableString(exercise.hint),
  };
}

export function normalizeSubmissionState(
  submission: SubmissionDetailContract | SubmissionFeedItemContract | null | undefined,
  exercise?: Pick<LearnerExercise, 'status' | 'prUrl'>
): LearnerSubmissionState {
  const status = normalizeSubmissionStatus(submission?.status ?? exercise?.status);
  const prUrl = normalizeUrl(submission?.prUrl ?? exercise?.prUrl);

  return {
    id: normalizeNullableString(submission?.id),
    status,
    prUrl,
    reviewNote: normalizeStringFromFlexibleValue(
      (submission as SubmissionDetailContract | undefined)?.reviewNote,
      ['note', 'comment', 'message', 'content', 'text']
    ),
    reviewerId: normalizeStringFromFlexibleValue(
      (submission as SubmissionDetailContract | undefined)?.reviewerId,
      ['id', 'reviewerId', 'uuid']
    ),
    submittedAt: normalizeNullableString(submission?.submittedAt),
    reviewedAt: normalizeStringFromFlexibleValue(
      (submission as SubmissionDetailContract | undefined)?.reviewedAt,
      ['date', 'at', 'reviewedAt']
    ),
    canSubmit: !prUrl && (status === 'pending' || status === 'in_progress'),
    canResubmit: status === 'changes' || status === 'rejected',
  };
}

export function getSubmissionExerciseId(submission: SubmissionFeedItemContract | SubmissionDetailContract): string | null {
  const directExerciseId = normalizeNullableString((submission as SubmissionDetailContract).exerciseId);
  if (directExerciseId) return directExerciseId;

  const exercise = submission.exercise;
  if (typeof exercise === 'string') return normalizeNullableString(exercise);
  if (typeof exercise !== 'object' || exercise === null) return null;
  return normalizeNullableString((exercise as { id?: unknown }).id);
}

export function getSubmissionExercise(submission: SubmissionFeedItemContract | SubmissionDetailContract): ExerciseDetailContract | null {
  return typeof submission.exercise === 'object' && submission.exercise !== null
    ? submission.exercise as ExerciseDetailContract
    : null;
}

export function normalizeReviewerName(submission: SubmissionFeedItemContract | SubmissionDetailContract): string | null {
  const maybeUser = (submission as SubmissionFeedItemContract & { user?: unknown }).user;
  if (typeof maybeUser === 'object' && maybeUser !== null) {
    return normalizeNullableString((maybeUser as { name?: unknown }).name);
  }

  return normalizeStringFromFlexibleValue(
    (submission as SubmissionDetailContract).reviewerId,
    ['name', 'fullName', 'email', 'id']
  );
}

export function normalizeExerciseFeedItem(
  exercise: ExerciseSummaryContract,
  submission?: SubmissionFeedItemContract | SubmissionDetailContract
): LearnerExerciseFeedItem | null {
  const summary = normalizeExerciseSummary(exercise);
  if (!summary) return null;

  const submissionState = normalizeSubmissionState(submission, summary);

  return {
    ...summary,
    status: submissionState.status,
    prUrl: submissionState.prUrl,
    submissionId: normalizeNullableString(submission?.id),
    reviewNote: normalizeStringFromFlexibleValue(
      (submission as SubmissionDetailContract | undefined)?.reviewNote,
      ['note', 'comment', 'message', 'content', 'text']
    ),
    reviewerName: submission ? normalizeReviewerName(submission) : null,
    submittedAt: normalizeNullableString(submission?.submittedAt),
    reviewedAt: normalizeStringFromFlexibleValue(
      (submission as SubmissionDetailContract | undefined)?.reviewedAt,
      ['date', 'at', 'reviewedAt']
    ),
  };
}

import {
  client,
  exercisesControllerFindAll,
  tracksControllerFindAll,
  tracksControllerFindOne,
  lessonsControllerFindLessons,
  lessonsControllerCompleteLesson,
  withAuthRetry,
} from '@/services/api-client';
import type { LearnerExercise, LearnerLesson, LearnerTrack, TrackLessonPreview } from './types';
import {
  extractDataArray,
  getErrorStatus,
  normalizeExerciseSummaries,
  normalizeLessonDetail,
  normalizeLessons,
  normalizeLessonsPreview,
  normalizeTrackDetail,
  normalizeTrackDetailWithCount,
  normalizeTrackSummaries,
  type ExerciseSummaryContract,
  type LessonDetailContract,
  type LessonProgressContract,
  type LessonSummaryContract,
  type TrackDetailContract,
  type TrackSummaryContract,
} from './utils';

const bearerSecurity = [{ scheme: 'bearer' as const, type: 'http' as const }];

type ErrorResponse = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

type LessonDetailResponses = {
  200: LessonDetailContract;
};

type LessonExerciseResponses = {
  200: ExerciseSummaryContract[] | { data?: ExerciseSummaryContract[] };
};

export interface CourseDetailData {
  course: LearnerTrack;
  lessons: TrackLessonPreview[];
}

export interface LessonPageData {
  course: LearnerTrack;
  lessons: LearnerLesson[];
  activeLesson: LearnerLesson;
  exercises: LearnerExercise[];
}

export interface CompleteLessonResult {
  lessonId?: string;
  trackId?: string;
  lessonsCompleted?: number;
  trackStatus?: LearnerTrack['status'];
  xpAwarded?: number;
  totalXp?: number;
  unlockedTrackId?: string | null;
}

export async function fetchCourses(): Promise<LearnerTrack[]> {
  const response = await withAuthRetry(() => tracksControllerFindAll({ throwOnError: true }));
  return normalizeTrackSummaries(
    extractDataArray<TrackSummaryContract>(response.data as unknown as TrackSummaryContract[] | { data?: TrackSummaryContract[] })
  );
}

export async function fetchCourseDetail(courseId: string): Promise<CourseDetailData> {
  const [courseResponse, lessonsResponse] = await Promise.all([
    tracksControllerFindOne({
      path: { id: courseId },
      throwOnError: true,
    }),
    lessonsControllerFindLessons({
      path: { id: courseId },
      throwOnError: true,
    }),
  ]);

  if (!courseResponse.data) throw new Error('Course not found');

  const courseDetail = courseResponse.data as TrackDetailContract;
  const lessons = normalizeLessonsPreview(
    extractDataArray<LessonSummaryContract>(lessonsResponse.data as unknown as { data?: LessonSummaryContract[] }),
    (courseDetail.lessons ?? []) as LessonProgressContract[]
  );

  return {
    course: normalizeTrackDetail(courseDetail, courseId, lessons),
    lessons,
  };
}

async function fetchLessonDetail(lessonId: string): Promise<LessonDetailContract | null> {
  try {
    const response = await client.get<LessonDetailResponses, ErrorResponse, true>({
      security: bearerSecurity,
      url: '/lessons/{id}',
      path: { id: lessonId },
      throwOnError: true,
    });

    return response.data ?? null;
  } catch (error) {
    if (getErrorStatus(error) === 404) throw error;
    return null;
  }
}

async function fetchLessonExercises(
  courseId: string,
  lessonId: string
): Promise<ExerciseSummaryContract[]> {
  try {
    const response = await client.get<LessonExerciseResponses, ErrorResponse, true>({
      security: bearerSecurity,
      url: '/lessons/{id}/exercises',
      path: { id: lessonId },
      throwOnError: true,
    });

    return extractDataArray<ExerciseSummaryContract>(response.data);
  } catch (error) {
    if (getErrorStatus(error) === 401) throw error;
  }

  const trackExercisesResponse = await exercisesControllerFindAll({
    query: { trackId: courseId },
    throwOnError: true,
  });
  const trackExercises = extractDataArray<ExerciseSummaryContract>(
    trackExercisesResponse.data as unknown as { data?: ExerciseSummaryContract[] }
  );
  const exercisesWithLessonId = trackExercises.filter((exercise) => exercise.lessonId);

  return exercisesWithLessonId.length > 0
    ? exercisesWithLessonId.filter((exercise) => exercise.lessonId === lessonId)
    : trackExercises;
}

export async function fetchLessonPage(
  courseId: string,
  lessonId: string
): Promise<LessonPageData> {
  const [courseDetail, lessonDetail, exerciseSummaries] = await Promise.all([
    fetchCourseDetail(courseId),
    fetchLessonDetail(lessonId),
    fetchLessonExercises(courseId, lessonId),
  ]);

  const fallbackLesson = courseDetail.lessons.find((lesson) => lesson.id === lessonId);
  if (!fallbackLesson && !lessonDetail) throw new Error('Lesson not found');
  if (lessonDetail?.trackId && lessonDetail.trackId !== courseId) throw new Error('Lesson not found');

  const lessonPreviews = fallbackLesson
    ? courseDetail.lessons
    : [
        ...courseDetail.lessons,
        {
          id: lessonDetail?.id ?? lessonId,
          title: lessonDetail?.title?.trim() || 'Untitled lesson',
          description: lessonDetail?.description?.trim() || '',
          estimatedTime: lessonDetail?.estimatedTime?.trim() || 'TBD',
          order: lessonDetail?.order ?? courseDetail.lessons.length + 1,
          completed: lessonDetail?.completed ?? false,
          type: lessonDetail?.type ?? 'reading',
        },
      ].sort((a, b) => a.order - b.order);

  const lessons = normalizeLessons(
    lessonPreviews as LessonSummaryContract[],
    lessonPreviews as LessonProgressContract[]
  ).map((lesson) => (
    lesson.id === lessonId
      ? normalizeLessonDetail(lessonDetail, fallbackLesson ?? lesson)
      : lesson
  ));

  const activeLesson = lessons.find((lesson) => lesson.id === lessonId);
  if (!activeLesson) throw new Error('Lesson not found');

  return {
    course: normalizeTrackDetailWithCount(
      {
        id: courseDetail.course.id,
        title: courseDetail.course.title,
        description: courseDetail.course.description,
        estimatedTime: courseDetail.course.estimatedTime,
        order: courseDetail.course.order,
        icon: courseDetail.course.icon ?? 'route',
        status: courseDetail.course.status,
        lessonsCompleted: courseDetail.course.lessonsCompleted,
        currentLessonId: courseDetail.course.currentLessonId,
        accessStatus: courseDetail.course.accessStatus,
        lockedReason: courseDetail.course.lockedReason,
        level: courseDetail.course.level,
        thumbnail: courseDetail.course.thumbnail,
      },
      courseId,
      lessons.length
    ),
    lessons,
    activeLesson,
    exercises: normalizeExerciseSummaries(exerciseSummaries),
  };
}

export async function completeLesson(lessonId: string): Promise<CompleteLessonResult> {
  const response = await lessonsControllerCompleteLesson({
    path: { id: lessonId },
    throwOnError: true,
  });

  const data = response.data;
  if (!data) return {};

  return {
    ...data,
    unlockedTrackId: typeof data.unlockedTrackId === 'string' ? data.unlockedTrackId : null,
  };
}

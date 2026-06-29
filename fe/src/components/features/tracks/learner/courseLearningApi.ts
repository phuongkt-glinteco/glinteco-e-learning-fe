import {
  exercisesControllerFindAll,
  exercisesControllerFindOne,
  submissionsControllerFindMine,
  submissionsControllerResubmit,
  submissionsControllerSubmit,
  tracksControllerFindAll,
  tracksControllerFindOne,
  lessonsControllerFindLessons,
  lessonsControllerFindOneLesson,
  lessonsControllerCompleteLesson,
  withAuthRetry,
} from '@/services/api-client';
import type {
  LearnerExercise,
  LearnerExerciseDetail,
  LearnerLesson,
  LearnerSubmissionState,
  LearnerTrack,
  TrackLessonPreview,
} from './types';
import {
  extractDataArray,
  getSubmissionExerciseId,
  getErrorStatus,
  normalizeExerciseDetail,
  normalizeExerciseSummaries,
  normalizeLessonDetail,
  normalizeLessons,
  normalizeLessonsPreview,
  normalizeLessonId,
  normalizeSubmissionState,
  normalizeTrackDetail,
  normalizeTrackDetailWithCount,
  normalizeTrackSummaries,
  type ExerciseDetailContract,
  type ExerciseSummaryContract,
  type LessonDetailContract,
  type LessonProgressContract,
  type LessonSummaryContract,
  type SubmissionDetailContract,
  type SubmissionFeedItemContract,
  type TrackDetailContract,
  type TrackSummaryContract,
} from './utils';

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

export interface ExercisePageData {
  course: LearnerTrack;
  lessons: LearnerLesson[];
  activeLesson: LearnerLesson;
  exercise: LearnerExerciseDetail;
  submission: LearnerSubmissionState;
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
  const [courseResponse, lessonsResponse] = await withAuthRetry(() =>
    Promise.all([
      tracksControllerFindOne({
        path: { id: courseId },
        throwOnError: true,
      }),
      lessonsControllerFindLessons({
        path: { id: courseId },
        throwOnError: true,
      }),
    ])
  );

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
    const response = await withAuthRetry(() =>
      lessonsControllerFindOneLesson({
        path: { id: lessonId },
        throwOnError: true,
      })
    );

    return (response.data as LessonDetailContract | undefined) ?? null;
  } catch (error) {
    if (getErrorStatus(error) === 404) throw error;
    return null;
  }
}

async function fetchLessonExercises(
  courseId: string,
  lessonId: string
): Promise<ExerciseSummaryContract[]> {
  const lessonExercisesResponse = await withAuthRetry(() =>
    exercisesControllerFindAll({
      query: { lessonId },
      throwOnError: true,
    })
  );
  const lessonExercises = extractDataArray<ExerciseSummaryContract>(
    lessonExercisesResponse.data as unknown as ExerciseSummaryContract[] | { data?: ExerciseSummaryContract[] }
  );
  const exercisesWithMatchingLessonId = lessonExercises.filter(
    (exercise) => normalizeLessonId(exercise.lessonId) === lessonId
  );

  if (exercisesWithMatchingLessonId.length > 0) return exercisesWithMatchingLessonId;
  if (lessonExercises.length > 0) return lessonExercises;

  const trackExercisesResponse = await withAuthRetry(() =>
    exercisesControllerFindAll({
      query: { trackId: courseId },
      throwOnError: true,
    })
  );
  const trackExercises = extractDataArray<ExerciseSummaryContract>(
    trackExercisesResponse.data as unknown as { data?: ExerciseSummaryContract[] }
  );
  const exercisesWithLessonId = trackExercises.filter((exercise) => normalizeLessonId(exercise.lessonId));

  return exercisesWithLessonId.length > 0
    ? exercisesWithLessonId.filter((exercise) => normalizeLessonId(exercise.lessonId) === lessonId)
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
  const response = await withAuthRetry(() =>
    lessonsControllerCompleteLesson({
      path: { id: lessonId },
      throwOnError: true,
    })
  );

  const data = response.data;
  if (!data) return {};

  return {
    ...data,
    unlockedTrackId: typeof data.unlockedTrackId === 'string' ? data.unlockedTrackId : null,
  };
}

async function fetchExerciseDetail(exerciseId: string): Promise<LearnerExerciseDetail> {
  const response = await withAuthRetry(() =>
    exercisesControllerFindOne({
      path: { id: exerciseId },
      throwOnError: true,
    })
  );

  const exercise = normalizeExerciseDetail(response.data as unknown as ExerciseDetailContract);
  if (!exercise) throw new Error('Exercise not found');
  return exercise;
}

async function fetchMySubmissionForExercise(
  exerciseId: string
): Promise<SubmissionFeedItemContract | null> {
  try {
    const response = await withAuthRetry(() =>
      submissionsControllerFindMine({ throwOnError: true })
    );
    const submissions = extractDataArray<SubmissionFeedItemContract>(
      response.data as unknown as { data?: SubmissionFeedItemContract[] }
    );
    return submissions.find((submission) => getSubmissionExerciseId(submission) === exerciseId) ?? null;
  } catch (error) {
    if (getErrorStatus(error) === 401) throw error;
    return null;
  }
}

export async function fetchExercisePage(
  courseId: string,
  lessonId: string,
  exerciseId: string
): Promise<ExercisePageData> {
  const [lessonPage, exercise] = await Promise.all([
    fetchLessonPage(courseId, lessonId),
    fetchExerciseDetail(exerciseId),
  ]);

  if (exercise.trackId && exercise.trackId !== courseId) throw new Error('Exercise not found');
  if (exercise.lessonId && exercise.lessonId !== lessonId) throw new Error('Exercise not found');

  const submission = await fetchMySubmissionForExercise(exerciseId);

  return {
    course: lessonPage.course,
    lessons: lessonPage.lessons,
    activeLesson: lessonPage.activeLesson,
    exercise,
    submission: normalizeSubmissionState(submission, exercise),
  };
}

export async function submitExercise(
  exerciseId: string,
  prUrl: string
): Promise<LearnerSubmissionState> {
  const response = await withAuthRetry(() =>
    submissionsControllerSubmit({
      path: { id: exerciseId },
      body: { prUrl },
      throwOnError: true,
    })
  );

  return normalizeSubmissionState(response.data as unknown as SubmissionDetailContract);
}

export async function resubmitExercise(
  exerciseId: string,
  prUrl: string
): Promise<LearnerSubmissionState> {
  const response = await withAuthRetry(() =>
    submissionsControllerResubmit({
      path: { id: exerciseId },
      body: { prUrl },
      throwOnError: true,
    })
  );

  return normalizeSubmissionState(response.data as unknown as SubmissionDetailContract);
}

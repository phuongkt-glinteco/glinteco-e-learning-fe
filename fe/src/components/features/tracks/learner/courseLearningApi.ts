import {
  exercisesControllerFindAll,
  exercisesControllerFindOne,
  submissionsControllerFindMine,
  submissionsControllerFindOne,
  submissionsControllerResubmit,
  submissionsControllerSubmit,
  SUPPRESS_ERROR_TOAST_HEADER,
  tracksControllerFindAll,
  tracksControllerFindOne,
  lessonsControllerFindLessons,
  lessonsControllerFindOneLesson,
  lessonsControllerCompleteLesson,
} from '@/services/api-client';
import type {
  LearnerExercise,
  LearnerExerciseFeedItem,
  LearnerExerciseDetail,
  LearnerLesson,
  LearnerSubmissionState,
  LearnerTrack,
  TrackLessonPreview,
} from './types';
import {
  extractDataArray,
  getSubmissionExerciseId,
  getSubmissionExercise,
  getErrorStatus,
  normalizeExerciseFeedItem,
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

const silentErrorToastOptions = {
  headers: { [SUPPRESS_ERROR_TOAST_HEADER]: 'true' },
} as const;

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

export interface MyExercisesData {
  exercises: LearnerExerciseFeedItem[];
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

function createFallbackCourse(exercise: LearnerExerciseDetail): LearnerTrack {
  return {
    id: exercise.trackId ?? 'standalone-exercises',
    title: exercise.trackTitle || 'Exercises',
    description: 'Standalone exercises available to the learner.',
    estimatedTime: exercise.estimatedTime,
    lessonCount: 0,
    lessonsCompleted: 0,
    order: 1,
    status: 'in_progress',
    icon: 'code',
    accessStatus: 'unlocked',
    lockedReason: null,
    currentLessonId: null,
    level: exercise.difficulty,
    thumbnail: null,
  };
}

function createFallbackLesson(exercise: LearnerExerciseDetail): LearnerLesson {
  return {
    id: exercise.lessonId ?? 'standalone-exercise',
    title: exercise.lessonId ? 'Linked lesson' : 'Standalone exercise',
    body: '',
    description: exercise.brief,
    estimatedTime: exercise.estimatedTime,
    order: 1,
    completed: false,
    xp: exercise.xp,
    type: 'assignment',
  };
}

export async function fetchCourses(): Promise<LearnerTrack[]> {
  const response = await tracksControllerFindAll({ throwOnError: true });
  return normalizeTrackSummaries(
    extractDataArray<TrackSummaryContract>(response.data as unknown as TrackSummaryContract[] | { data?: TrackSummaryContract[] })
  );
}

function shouldHydrateSubmission(submission: SubmissionFeedItemContract) {
  const status = normalizeSubmissionState(submission).status;
  return status === 'changes' || status === 'rejected' || status === 'approved';
}

async function hydrateSubmissionDetail(
  submission: SubmissionFeedItemContract
): Promise<SubmissionFeedItemContract | SubmissionDetailContract> {
  if (!submission.id || !shouldHydrateSubmission(submission)) return submission;

  try {
    const response = await submissionsControllerFindOne({
      path: { id: submission.id },
      throwOnError: true,
      ...silentErrorToastOptions,
    });

    return (response.data as unknown as SubmissionDetailContract | undefined) ?? submission;
  } catch (error) {
    if (getErrorStatus(error) === 401) throw error;
    return submission;
  }
}

export async function fetchMyExercises(): Promise<MyExercisesData> {
  const [exerciseResponse, submissionResponse] = await Promise.all([
    exercisesControllerFindAll({
      query: { limit: 100 },
      throwOnError: true,
      ...silentErrorToastOptions,
    }),
    submissionsControllerFindMine({ throwOnError: true, ...silentErrorToastOptions }),
  ]);

  const exercises = extractDataArray<ExerciseSummaryContract>(
    exerciseResponse.data as unknown as ExerciseSummaryContract[] | { data?: ExerciseSummaryContract[] }
  );
  const rawSubmissions = extractDataArray<SubmissionFeedItemContract>(
    submissionResponse.data as unknown as { data?: SubmissionFeedItemContract[] }
  );
  const submissions = await Promise.all(rawSubmissions.map(hydrateSubmissionDetail));
  const submissionByExerciseId = new Map(
    submissions
      .map((submission) => [getSubmissionExerciseId(submission), submission] as const)
      .filter((entry): entry is readonly [string, SubmissionFeedItemContract | SubmissionDetailContract] => Boolean(entry[0]))
  );
  const exerciseIds = new Set(exercises.map((exercise) => exercise.id).filter(Boolean));
  const feedItems = exercises
    .map((exercise) => normalizeExerciseFeedItem(exercise, submissionByExerciseId.get(exercise.id ?? '')))
    .filter((exercise): exercise is LearnerExerciseFeedItem => Boolean(exercise));

  const submittedOnlyItems = submissions
    .filter((submission) => {
      const exerciseId = getSubmissionExerciseId(submission);
      return exerciseId && !exerciseIds.has(exerciseId);
    })
    .map((submission) => {
      const submissionExercise = getSubmissionExercise(submission);
      return submissionExercise ? normalizeExerciseFeedItem(submissionExercise, submission) : null;
    })
    .filter((exercise): exercise is LearnerExerciseFeedItem => Boolean(exercise));

  return {
    exercises: [...feedItems, ...submittedOnlyItems],
  };
}

export async function fetchCourseDetail(courseId: string): Promise<CourseDetailData> {
  const [courseResponse, lessonsResponse] = await Promise.all([
    tracksControllerFindOne({
      path: { id: courseId },
      throwOnError: true,
      ...silentErrorToastOptions,
    }),
    lessonsControllerFindLessons({
      path: { id: courseId },
      throwOnError: true,
      ...silentErrorToastOptions,
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
    const response = await lessonsControllerFindOneLesson({
      path: { id: lessonId },
      throwOnError: true,
      ...silentErrorToastOptions,
    });

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
  const lessonExercisesResponse = await exercisesControllerFindAll({
    query: { lessonId },
    throwOnError: true,
    ...silentErrorToastOptions,
  });
  const lessonExercises = extractDataArray<ExerciseSummaryContract>(
    lessonExercisesResponse.data as unknown as ExerciseSummaryContract[] | { data?: ExerciseSummaryContract[] }
  );
  const exercisesWithMatchingLessonId = lessonExercises.filter(
    (exercise) => normalizeLessonId(exercise.lessonId) === lessonId
  );

  if (exercisesWithMatchingLessonId.length > 0) return exercisesWithMatchingLessonId;
  if (lessonExercises.length > 0) return lessonExercises;

  const trackExercisesResponse = await exercisesControllerFindAll({
    query: { trackId: courseId },
    throwOnError: true,
    ...silentErrorToastOptions,
  });
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

async function fetchExerciseDetail(exerciseId: string): Promise<LearnerExerciseDetail> {
  const response = await exercisesControllerFindOne({
    path: { id: exerciseId },
    throwOnError: true,
    ...silentErrorToastOptions,
  });

  const exercise = normalizeExerciseDetail(response.data as unknown as ExerciseDetailContract);
  if (!exercise) throw new Error('Exercise not found');
  return exercise;
}

async function fetchMySubmissionForExercise(
  exerciseId: string
): Promise<SubmissionFeedItemContract | SubmissionDetailContract | null> {
  try {
    const response = await submissionsControllerFindMine({ throwOnError: true, ...silentErrorToastOptions });
    const submissions = extractDataArray<SubmissionFeedItemContract>(
      response.data as unknown as { data?: SubmissionFeedItemContract[] }
    );
    const submission = submissions.find((item) => getSubmissionExerciseId(item) === exerciseId) ?? null;
    return submission ? hydrateSubmissionDetail(submission) : null;
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

export async function fetchStandaloneExercisePage(exerciseId: string): Promise<ExercisePageData> {
  const exercise = await fetchExerciseDetail(exerciseId);
  const submission = await fetchMySubmissionForExercise(exerciseId);
  let course = createFallbackCourse(exercise);
  let activeLesson = createFallbackLesson(exercise);
  let lessons: LearnerLesson[] = [activeLesson];

  if (exercise.trackId) {
    try {
      const courseDetail = await fetchCourseDetail(exercise.trackId);
      course = courseDetail.course;

      const linkedLesson = exercise.lessonId
        ? courseDetail.lessons.find((lesson) => lesson.id === exercise.lessonId)
        : null;

      if (linkedLesson) {
        activeLesson = {
          ...linkedLesson,
          body: '',
          xp: exercise.xp,
        };
        lessons = [activeLesson];
      }
    } catch (error) {
      if (getErrorStatus(error) === 401) throw error;
    }
  }

  return {
    course,
    lessons,
    activeLesson,
    exercise,
    submission: normalizeSubmissionState(submission, exercise),
  };
}

function extractSubmissionContract(raw: unknown): SubmissionDetailContract {
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data && typeof raw.data === 'object') {
    return raw.data as SubmissionDetailContract;
  }
  return raw as SubmissionDetailContract;
}

export async function submitExercise(
  exerciseId: string,
  prUrl: string
): Promise<LearnerSubmissionState> {
  const response = await submissionsControllerSubmit({
    path: { id: exerciseId },
    body: { prUrl },
    throwOnError: true,
    ...silentErrorToastOptions,
  });

  return normalizeSubmissionState(extractSubmissionContract(response.data));
}

export async function resubmitExercise(
  exerciseId: string,
  prUrl: string
): Promise<LearnerSubmissionState> {
  const response = await submissionsControllerResubmit({
    path: { id: exerciseId },
    body: { prUrl },
    throwOnError: true,
    ...silentErrorToastOptions,
  });

  return normalizeSubmissionState(extractSubmissionContract(response.data));
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Skeleton from '@/components/ui/loading/Skeleton';
import { ExerciseDetailView } from './ExerciseDetailView';
import {
  fetchExercisePage,
  fetchStandaloneExercisePage,
  resubmitExercise,
  submitExercise,
  type ExercisePageData,
} from './courseLearningApi';
import type { LearnerSubmissionFormValues } from './types';
import { getErrorMessage, getLearnerRouteBase, getRouteParam } from './utils';

const EXERCISE_RETURN_KEY = 'learnerExerciseReturnTo';

function getStoredExerciseReturnTo(exerciseId: string): string | null {
  const rawReturnTo = window.sessionStorage.getItem(EXERCISE_RETURN_KEY);
  if (!rawReturnTo) return null;

  try {
    const parsed = JSON.parse(rawReturnTo) as { exerciseId?: unknown; returnTo?: unknown };
    if (parsed.exerciseId === exerciseId && typeof parsed.returnTo === 'string') {
      return parsed.returnTo;
    }
  } catch {
    window.sessionStorage.removeItem(EXERCISE_RETURN_KEY);
  }

  return null;
}

function validatePullRequestUrl(value: string): string | null {
  if (!value) return 'Please enter a pull request URL.';

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return 'Please enter a valid URL.';
  }

  const isGithubUrl = url.hostname === 'github.com' || url.hostname.endsWith('.github.com');
  const isPullRequestPath = /^\/[^/]+\/[^/]+\/pull\/\d+\/?$/.test(url.pathname);

  if (!isGithubUrl || !isPullRequestPath) {
    return 'Please enter a valid GitHub pull request URL.';
  }

  return null;
}

import { RedirectToParent } from '@/components/ui';
import { useTranslations } from 'next-intl';

function ExerciseLoadingState() {
  return (
    <div className="mx-auto flex max-w-container-max flex-col gap-6 px-gutter py-8">
      <div className="rounded-lg border border-outline-variant bg-surface p-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton width={36} height={36} rounded="rounded-lg" />
          <div className="min-w-0 flex-1">
            <Skeleton width={90} height={16} rounded="rounded" />
            <Skeleton width="56%" height={28} rounded="rounded" className="mt-2" />
          </div>
          <Skeleton width={120} height={30} rounded="rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-lg border border-outline-variant bg-surface p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap gap-2">
            <Skeleton width={84} height={24} rounded="rounded" />
            <Skeleton width={96} height={24} rounded="rounded" />
            <Skeleton width={76} height={24} rounded="rounded" />
          </div>
          <Skeleton width="72%" height={32} rounded="rounded" />
          <Skeleton width="94%" height={18} rounded="rounded" className="mt-4" />
          <Skeleton width="82%" height={18} rounded="rounded" className="mt-2" />
          <Skeleton height={180} rounded="rounded-lg" className="mt-6" />
          <Skeleton height={140} rounded="rounded-lg" className="mt-6" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton height={188} rounded="rounded-lg" />
          <Skeleton height={230} rounded="rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ExerciseErrorState({
  title,
  message,
  onRetry,
  backHref,
  backLabel,
}: {
  title: string;
  message: string;
  onRetry: () => void;
  backHref: string;
  backLabel: string;
}) {
  const t = useTranslations('ExerciseDetailContainer');
  return (
    <section className="mx-auto max-w-container-max px-gutter py-8">
      <div className="max-w-[760px] rounded-lg border border-error-container bg-error-container/40 p-6 text-error">
        <h1 className="headline-sm">{title}</h1>
        <p className="body-sm mt-2">{message}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <RedirectToParent href={backHref} label={backLabel} />
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 label-sm text-on-primary hover:opacity-90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            {t('retry', { defaultValue: 'Retry' })}
          </button>
        </div>
      </div>
    </section>
  );
}

export default function ExerciseDetailContainer() {
  const params = useParams();
  const router = useRouter();
  const courseId = getRouteParam(params.courseId ?? params.trackId);
  const lessonId = getRouteParam(params.lessonId);
  const exerciseId = getRouteParam(params.exerciseId);
  const routeBase = getLearnerRouteBase(params.trackId);
  const isStandaloneRoute = !courseId || !lessonId;
  const t = useTranslations('ExerciseDetailContainer');

  const [pageData, setPageData] = useState<ExercisePageData | null>(null);
  const [formValues, setFormValues] = useState<LearnerSubmissionFormValues>({ prUrl: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);

  const loadExercise = useCallback(async () => {
    if (!exerciseId) {
      setError(t('missingRouteParam', { defaultValue: 'Missing exercise route parameter.' }));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSubmitError(null);

    try {
      const nextPageData = isStandaloneRoute
        ? await fetchStandaloneExercisePage(exerciseId)
        : await fetchExercisePage(courseId, lessonId, exerciseId);
      setPageData(nextPageData);
      setFormValues({ prUrl: nextPageData.submission.prUrl ?? '' });
      setStartError(null);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, t('loadFailed', { defaultValue: 'Failed to load exercise details.' })));
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, exerciseId, isStandaloneRoute, t]);

  useEffect(() => {
    loadExercise();
  }, [loadExercise]);

  async function handleSubmit() {
    if (!pageData || !exerciseId) return;

    const nextPrUrl = formValues.prUrl.trim();
    const validationError = validatePullRequestUrl(nextPrUrl);
    if (validationError) {
      setSubmitError(validationError); // Could also translate these if needed
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitMessage(null);

    try {
      const nextSubmission = pageData.submission.canResubmit
        ? await resubmitExercise(exerciseId, nextPrUrl)
        : await submitExercise(exerciseId, nextPrUrl);

      setPageData({
        ...pageData,
        submission: nextSubmission,
      });
      setFormValues({ prUrl: nextSubmission.prUrl ?? nextPrUrl });
      setSubmitMessage(t('submissionSuccess', { defaultValue: 'Submission saved successfully.' }));
    } catch (submitFailure: unknown) {
      setSubmitError(getErrorMessage(submitFailure, t('submitFailed', { defaultValue: 'Failed to submit exercise.' })));
    } finally {
      setSubmitting(false);
    }
  }

  function handleStartExercise() {
    setSubmitMessage(null);
    setSubmitError(null);
    // TODO: Replace this with a learner-scoped start mutation when the backend exposes one,
    // e.g. PATCH /api/v1/learner/exercises/:exerciseId/start returning status IN_PROGRESS.
    setStartError(
      t('startError', { defaultValue: 'Starting an exercise cannot be saved yet because the backend API does not expose a learner exercise start endpoint.' })
    );
  }

  function handleBackToLesson() {
    if (exerciseId) {
      const storedReturnTo = getStoredExerciseReturnTo(exerciseId);
      if (storedReturnTo) {
        window.sessionStorage.removeItem(EXERCISE_RETURN_KEY);
        router.push(storedReturnTo);
        return;
      }
    }

    if (isStandaloneRoute) {
      router.push('/exercises');
      return;
    }

    if (!courseId || !lessonId) {
      router.push(`/${routeBase}`);
      return;
    }
    router.push(`/${routeBase}/${courseId}/lessons/${lessonId}`);
  }

  function getBackHref() {
    if (exerciseId) {
      const storedReturnTo = getStoredExerciseReturnTo(exerciseId);
      if (storedReturnTo) return storedReturnTo;
    }
    if (isStandaloneRoute) return '/exercises';
    if (!courseId || !lessonId) return `/${routeBase}`;
    return `/${routeBase}/${courseId}/lessons/${lessonId}`;
  }

  if (loading) return <ExerciseLoadingState />;

  if (error || !pageData) {
    return (
      <ExerciseErrorState
        title={t('notAvailableTitle', { defaultValue: 'Exercise not available' })}
        message={error ?? t('notFoundMessage', { defaultValue: 'This exercise does not exist in the selected lesson.' })}
        backHref={getBackHref()}
        backLabel={isStandaloneRoute ? t('backToExercises', { defaultValue: 'Back to Exercises' }) : t('backToLesson', { defaultValue: 'Back to Lesson' })}
        onRetry={loadExercise}
      />
    );
  }

  return (
    <ExerciseDetailView
      track={pageData.course}
      activeLesson={pageData.activeLesson}
      exercise={pageData.exercise}
      submission={pageData.submission}
      prUrl={formValues.prUrl}
      submitting={submitting}
      startError={startError}
      submitError={submitError}
      submitMessage={submitMessage}
      backLabel={isStandaloneRoute ? t('backToExercises', { defaultValue: 'Exercises' }) : pageData.activeLesson.title}
      onBackToLesson={handleBackToLesson}
      onPrUrlChange={(value) => setFormValues({ prUrl: value })}
      onStartExercise={handleStartExercise}
      onSubmit={handleSubmit}
    />
  );
}

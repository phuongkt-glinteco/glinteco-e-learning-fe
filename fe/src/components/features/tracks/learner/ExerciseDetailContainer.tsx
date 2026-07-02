'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Skeleton from '@/components/ui/loading/Skeleton';
import { ExerciseDetailView } from './ExerciseDetailView';
import {
  fetchExercisePage,
  fetchSubmissionHistory,
  fetchStandaloneExercisePage,
  resubmitExercise,
  submitExercise,
  type ExercisePageData,
} from './courseLearningApi';
import type { LearnerSubmissionFormValues, LearnerSubmissionHistoryItem } from './types';
import { getErrorMessage, getLearnerRouteBase, getRouteParam } from './utils';
import { isUiShowError } from '@/services/errors';

import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
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
  const [historyItems, setHistoryItems] = useState<LearnerSubmissionHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const { pushNode, setTree, getBackHref, tree } = useBreadcrumbStore();

  const loadSubmissionHistory = useCallback(async (submissionId: string | null) => {
    if (!submissionId) {
      setHistoryItems([]);
      setHistoryError(null);
      setHistoryLoading(false);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(null);
    setHistoryItems([]);

    try {
      const nextHistory = await fetchSubmissionHistory(submissionId);
      setHistoryItems(nextHistory);
    } catch (historyFailure: unknown) {
      setHistoryError(getErrorMessage(historyFailure, t('historyLoadFailed', { defaultValue: 'Failed to load submission history.' })));
    } finally {
      setHistoryLoading(false);
    }
  }, [t]);

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
      void loadSubmissionHistory(nextPageData.submission.id);
      setStartError(null);

      if (isStandaloneRoute) {
        if (tree.length === 0) {
          setTree([{ label: t('exercises', { defaultValue: 'Exercises' }), href: '/exercises' }]);
        }
      } else {
        if (tree.length === 0) {
          setTree([
            { label: t('tracks', { defaultValue: 'Learning Tracks' }), href: `/${routeBase}` },
            { label: nextPageData.course.title, href: `/${routeBase}/${courseId}` },
            { label: nextPageData.activeLesson.title, href: `/${routeBase}/${courseId}/lessons/${lessonId}` }
          ]);
        }
      }
      
      pushNode({ label: nextPageData.exercise.title, href: window.location.pathname });
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, t('loadFailed', { defaultValue: 'Failed to load exercise details.' })));
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, exerciseId, isStandaloneRoute, routeBase, setTree, pushNode, tree.length, loadSubmissionHistory]);

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
      void loadSubmissionHistory(nextSubmission.id);
      setSubmitMessage(t('submissionSuccess', { defaultValue: 'Submission saved successfully.' }));
    } catch (submitFailure: unknown) {
      console.error('Submit exercise error:', submitFailure);
      if (isUiShowError(submitFailure) && submitFailure.errorCode === 'SUBMIT_EXERCISE_FAILED') {
        setSubmitError(t('SUBMIT_EXERCISE_FAILED', { defaultValue: t('submitFailed', { defaultValue: 'Failed to submit exercise.' }) }));
      } else {
        setSubmitError(getErrorMessage(submitFailure, t('submitFailed', { defaultValue: 'Failed to submit exercise.' })));
      }
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

  function getBackHrefPath() {
    const fallbackHref = isStandaloneRoute
      ? '/exercises'
      : (!courseId || !lessonId) ? `/${routeBase}` : `/${routeBase}/${courseId}/lessons/${lessonId}`;
    return getBackHref(fallbackHref);
  }

  if (loading) return <ExerciseLoadingState />;

  if (error || !pageData) {
    return (
      <ExerciseErrorState
        title={t('notAvailableTitle', { defaultValue: 'Exercise not available' })}
        message={error ?? t('notFoundMessage', { defaultValue: 'This exercise does not exist in the selected lesson.' })}
        backHref={getBackHrefPath() || ''}
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
      historyItems={historyItems}
      historyLoading={historyLoading}
      historyError={historyError}
      onPrUrlChange={(value) => setFormValues({ prUrl: value })}
      onStartExercise={handleStartExercise}
      onSubmit={handleSubmit}
      onRetryHistory={() => loadSubmissionHistory(pageData.submission.id)}
      onBackToTrack={() => {
        const targetTrackId = pageData.exercise.trackId || pageData.course.id;
        if (targetTrackId) {
          router.push(`/${routeBase}/${targetTrackId}`);
        } else {
          router.push(`/${routeBase}`);
        }
      }}
    />
  );
}

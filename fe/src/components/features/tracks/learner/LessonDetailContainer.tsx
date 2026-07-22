'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Skeleton from '@/components/ui/loading/Skeleton';
import { LessonDetailView } from './LessonDetailView';
import type { LearnerExercise, LearnerLesson, LearnerTrack } from './types';
import { completeLesson, fetchLessonPage } from './courseLearningApi';
import {
  getAdjacentLessonIds,
  getContinueLessonId,
  getLessonAccessState,
  getLessonCompletionBlocker,
  getErrorMessage,
  getLearnerRouteBase,
  getRouteParam,
} from './utils';

import { RedirectToParent } from '@/components/ui';
import { useTranslations } from 'next-intl';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';

function LessonLoadingState() {
  return (
    <div className="mx-auto flex max-w-container-max flex-col gap-6 px-gutter py-8 w-full">
      <div className="rounded-lg border border-outline-variant bg-surface p-4 shadow-sm w-full">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 w-full">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton width={36} height={36} rounded="rounded-lg" />
            <div>
              <Skeleton width={112} height={16} rounded="rounded" />
              <Skeleton width={260} height={28} rounded="rounded" className="mt-2 max-w-full" />
            </div>
          </div>
          <Skeleton width={104} height={30} rounded="rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4 w-full">
        <div className="rounded-lg border border-outline-variant bg-surface p-4 shadow-sm w-full">
          <Skeleton width={140} height={18} rounded="rounded" />
          <Skeleton width="100%" height={1} rounded="rounded-none" className="my-3 w-full" />
          <div className="space-y-2 w-full">
            <Skeleton height={40} rounded="rounded-lg" className="w-full" />
            <Skeleton height={40} rounded="rounded-lg" className="w-full" />
            <Skeleton height={40} rounded="rounded-lg" className="w-full" />
            <Skeleton height={40} rounded="rounded-lg" className="w-full" />
          </div>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface p-6 shadow-sm lg:col-span-2 w-full">
          <div className="mb-4 flex flex-wrap gap-2">
            <Skeleton width={82} height={24} rounded="rounded" />
            <Skeleton width={68} height={24} rounded="rounded" />
            <Skeleton width={92} height={24} rounded="rounded" />
          </div>
          <Skeleton width="78%" height={34} rounded="rounded" />
          <Skeleton width="92%" height={18} rounded="rounded" className="mt-3" />
          <Skeleton width="64%" height={18} rounded="rounded" className="mt-2" />
          <Skeleton height={180} rounded="rounded-lg" className="mt-6 w-full" />
          <Skeleton height={150} rounded="rounded-lg" className="mt-6 w-full" />
        </div>
        <div className="flex flex-col gap-6 w-full">
          <Skeleton height={245} rounded="rounded-lg" className="w-full" />
          <Skeleton height={180} rounded="rounded-lg" className="w-full" />
        </div>
      </div>
    </div>
  );
}

function LessonErrorState({
  title,
  message,
  onRetry,
  retryLabel,
  backHref,
  backLabel,
}: {
  title: string;
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  backHref: string;
  backLabel: string;
}) {
  const t = useTranslations('LessonDetailContainer');
  return (
    <section className="mx-auto max-w-container-max px-gutter py-8 w-full">
      <div className="max-w-[760px] rounded-lg border border-error-container bg-error-container/40 p-6 text-error">
        <h1 className="headline-sm">{title}</h1>
        <p className="body-sm mt-2">{message}</p>
        <div className="flex gap-3 flex-wrap mt-4">
          <RedirectToParent href={backHref} label={backLabel} />
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 label-sm text-on-primary hover:opacity-90 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            {retryLabel ?? t('retry', { defaultValue: 'Retry' })}
          </button>
        </div>
      </div>
    </section>
  );
}

export default function LessonDetailContainer() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = getRouteParam(params.courseId ?? params.trackId);
  const lessonId = getRouteParam(params.lessonId);
  const routeBase = getLearnerRouteBase(params.trackId);
  const t = useTranslations('LessonDetailContainer');
  const fromQuery = searchParams.get('from');
  const querySuffix = fromQuery ? `?from=${encodeURIComponent(fromQuery)}` : '';

  const [track, setTrack] = useState<LearnerTrack | null>(null);
  const [lessons, setLessons] = useState<LearnerLesson[]>([]);
  const [exercises, setExercises] = useState<LearnerExercise[]>([]);
  const [activeLesson, setActiveLesson] = useState<LearnerLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [completionBlocker, setCompletionBlocker] = useState<ReturnType<typeof getLessonCompletionBlocker>>(null);
  const { pushNode, setTree, tree } = useBreadcrumbStore();

  const loadLessonData = useCallback(async () => {
    if (!courseId || !lessonId) {
      setError(t('missingRouteParam', { defaultValue: 'Missing course or lesson route parameters.' }));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setCompletionError(null);
    setCompletionBlocker(null);

    try {
      const lessonPage = await fetchLessonPage(courseId, lessonId);
      setLessons(lessonPage.lessons);
      setTrack(lessonPage.course);
      setActiveLesson(lessonPage.activeLesson);
      setExercises(lessonPage.exercises);
      
      if (tree.length === 0) {
        setTree([
          { label: t('tracks', { defaultValue: 'Learning Tracks' }), href: `/${routeBase}` },
          { label: lessonPage.course.title, href: `/${routeBase}/${courseId}` }
        ]);
      }
      
      pushNode({ label: lessonPage.activeLesson.title, href: window.location.pathname });
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, t('loadFailed', { defaultValue: 'Failed to load lesson details.' })));
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId, routeBase, setTree, pushNode, tree.length]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  const { previousLessonId, nextLessonId } = useMemo(
    () => getAdjacentLessonIds(lessons, lessonId),
    [lessons, lessonId]
  );
  const activeLessonAccessState = useMemo(
    () => getLessonAccessState(lessons, lessonId),
    [lessons, lessonId]
  );
  const activeLessonLocked = activeLessonAccessState === 'locked';
  const nextLessonLocked = useMemo(
    () => (nextLessonId ? getLessonAccessState(lessons, nextLessonId) === 'locked' : false),
    [lessons, nextLessonId]
  );
  const continueLessonId = useMemo(
    () => getContinueLessonId(lessons, track?.currentLessonId),
    [lessons, track?.currentLessonId]
  );

  const nextTrack = track?.nextTrack && track.nextTrack.id ? track.nextTrack : null;

  async function handleCompleteLesson() {
    if (!activeLesson || activeLesson.completed || !track || activeLessonLocked) return;

    setCompleting(true);
    setCompletionError(null);
    setCompletionMessage(null);
    setCompletionBlocker(null);

    try {
      const response = await completeLesson(activeLesson.id);

      const xpAwarded = response.xpAwarded ?? activeLesson.xp;
      const nextCompletedCount = response.lessonsCompleted
        ?? Math.min(track.lessonsCompleted + 1, track.lessonCount);
      const nextStatus = response.trackStatus
        ?? (nextCompletedCount >= track.lessonCount ? 'completed' : 'in_progress');
      setCompletionMessage(t('lessonCompleted', { xp: xpAwarded, defaultValue: `Lesson completed. +${xpAwarded} XP awarded.` }));
      setActiveLesson({ ...activeLesson, completed: true });
      setTrack({ ...track, lessonsCompleted: nextCompletedCount, status: nextStatus });
      await loadLessonData();
    } catch (completeError: unknown) {
      const blocker = getLessonCompletionBlocker(completeError);
      if (blocker) {
        setCompletionBlocker(blocker);
        setCompletionError(t('mandatoryExercisesIncomplete', {
          defaultValue: 'Complete the required exercises before finishing this lesson.',
        }));
        return;
      }

      setCompletionError(getErrorMessage(completeError, t('completeFailed', { defaultValue: 'Failed to complete lesson.' })));
    } finally {
      setCompleting(false);
    }
  }

  function handleSelectLesson(targetLessonId: string) {
    if (!targetLessonId) return;
    if (targetLessonId.startsWith('track:')) {
      const targetTrackId = targetLessonId.replace('track:', '');
      router.push(`/${routeBase}/${targetTrackId}${querySuffix}`);
      return;
    }
    if (!courseId) return;
    if (getLessonAccessState(lessons, targetLessonId) === 'locked') return;
    router.push(`/${routeBase}/${courseId}/lessons/${targetLessonId}${querySuffix}`);
  }

  function handleOpenExercise(exerciseId: string) {
    if (!courseId || !lessonId || !exerciseId) return;
    router.push(`/${routeBase}/${courseId}/lessons/${lessonId}/exercises/${exerciseId}${querySuffix}`);
  }

  if (loading) return <LessonLoadingState />;

  if (error) {
    return (
      <LessonErrorState
        title={t('notAvailableTitle', { defaultValue: 'Lesson not available' })}
        message={error}
        backHref={`/${routeBase}`}
        backLabel={t('backToTracks', { defaultValue: 'Back to tracks' })}
        onRetry={loadLessonData}
      />
    );
  }

  if (!track || !activeLesson) {
    return (
      <LessonErrorState
        title={t('notFoundTitle', { defaultValue: 'Lesson not found' })}
        message={t('notFoundMessage', { defaultValue: 'This lesson does not exist in the selected track.' })}
        backHref={`/${routeBase}`}
        backLabel={t('backToTracks', { defaultValue: 'Back to tracks' })}
        onRetry={loadLessonData}
      />
    );
  }

  if (activeLessonLocked) {
    return (
      <LessonErrorState
        title={t('lockedTitle', { defaultValue: 'Lesson is locked' })}
        message={t('lessonLockedMessage', { defaultValue: 'Complete the previous lesson to unlock this step.' })}
        backHref={`/${routeBase}/${courseId}`}
        backLabel={t('backToCourse', { defaultValue: 'Back to course' })}
        onRetry={() => {
          if (continueLessonId) {
            handleSelectLesson(continueLessonId);
            return;
          }
          router.push(`/${routeBase}/${courseId}${querySuffix}`);
        }}
        retryLabel={t('goToCurrentLesson', { defaultValue: 'Go to current lesson' })}
      />
    );
  }

  return (
    <LessonDetailView
      track={track}
      lessons={lessons}
      activeLesson={activeLesson}
      activeLessonLocked={activeLessonLocked}
      previousLessonId={previousLessonId}
      nextLessonId={nextLessonId ?? (nextTrack ? 'track:' + nextTrack.id : null)}
      nextLessonLocked={nextLessonLocked}
      exercises={exercises}
      completing={completing}
      completionMessage={completionMessage}
      completionError={completionError}
      completionBlocker={completionBlocker}
      onBackToTracks={() => router.push(`/${routeBase}/${courseId}${querySuffix}`)}
      onSelectLesson={handleSelectLesson}
      onOpenExercise={handleOpenExercise}
      onCompleteLesson={handleCompleteLesson}
      onCloseCompletionBlocker={() => setCompletionBlocker(null)}
    />
  );
}

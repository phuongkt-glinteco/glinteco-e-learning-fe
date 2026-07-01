'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Skeleton from '@/components/ui/loading/Skeleton';
import { CourseDetailView } from './CourseDetailView';
import type { LearnerTrack, TrackLessonPreview } from './types';
import { fetchCourseDetail } from './courseLearningApi';
import {
  getContinueLessonId,
  getErrorStatus,
  getErrorMessage,
  getLearnerRouteBase,
  getRouteParam,
} from './utils';

import { RedirectToParent } from '@/components/ui';

function CourseDetailLoadingState() {
  return (
    <section className="mx-auto flex max-w-container-max flex-col gap-6 px-gutter py-8">
      <Skeleton width={260} height={32} rounded="rounded-lg" />
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1fr_220px] lg:items-center">
          <div className="min-w-0">
            <Skeleton width={140} height={28} rounded="rounded-full" className="mb-4" />
            <Skeleton width="72%" height={44} rounded="rounded" />
            <Skeleton width="88%" height={20} rounded="rounded" className="mt-4" />
            <Skeleton width="64%" height={20} rounded="rounded" className="mt-2" />
            <div className="mt-5 flex flex-wrap gap-3">
              <Skeleton width={116} height={38} rounded="rounded-lg" />
              <Skeleton width={104} height={38} rounded="rounded-lg" />
              <Skeleton width={124} height={38} rounded="rounded-lg" />
            </div>
          </div>
          <div className="flex justify-center">
            <Skeleton width={168} height={168} rounded="rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_320px] xl:items-start">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <Skeleton width={180} height={24} rounded="rounded" />
              <Skeleton width={320} height={18} rounded="rounded" className="mt-2 max-w-full" />
            </div>
            <Skeleton width={92} height={28} rounded="rounded-full" />
          </div>
          <div className="space-y-4">
            <Skeleton height={116} rounded="rounded-lg" />
            <Skeleton height={116} rounded="rounded-lg" />
            <Skeleton height={116} rounded="rounded-lg" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton height={150} rounded="rounded-lg" />
          <Skeleton height={132} rounded="rounded-lg" />
        </div>
      </div>
    </section>
  );
}

function CourseDetailErrorState({
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
  const t = useTranslations('CourseDetailContainer');

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

import { useTranslations } from 'next-intl';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';

export default function CourseDetailContainer() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = getRouteParam(params.courseId ?? params.trackId);
  const routeBase = getLearnerRouteBase(params.trackId);
  const t = useTranslations('CourseDetailContainer');
  const fromQuery = searchParams.get('from');

  const [track, setTrack] = useState<LearnerTrack | null>(null);
  const [lessons, setLessons] = useState<TrackLessonPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { pushNode, setTree, tree } = useBreadcrumbStore();

  const loadCourseDetail = useCallback(async () => {
    if (!courseId) {
      setError(t('missingRouteParam', { defaultValue: 'Missing course route parameter.' }));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const courseDetail = await fetchCourseDetail(courseId);
      setLessons(courseDetail.lessons);
      setTrack(courseDetail.course);
      
      // If starting fresh or jumping from outside, initialize base
      if (tree.length === 0) {
        if (fromQuery === 'dashboard') {
          setTree([{ label: t('dashboard', { defaultValue: 'Dashboard' }), href: '/dashboard/learner' }]);
        } else if (fromQuery === 'my-courses') {
          setTree([{ label: t('myCourses', { defaultValue: 'My Courses' }), href: '/my-courses' }]);
        } else {
          setTree([{ label: t('learningTracks', { defaultValue: 'Learning Tracks' }), href: `/${routeBase}` }]);
        }
      }
      
      pushNode({ label: courseDetail.course.title, href: window.location.pathname });
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError, t('loadFailed', { defaultValue: 'Failed to load course details.' })));
    } finally {
      setLoading(false);
    }
  }, [courseId, searchParams, setTree, pushNode, tree.length]);

  useEffect(() => {
    loadCourseDetail();
  }, [loadCourseDetail]);

  const continueLessonId = useMemo(
    () => getContinueLessonId(lessons, track?.currentLessonId),
    [lessons, track?.currentLessonId]
  );

  const nextTrack = track?.nextTrack && track.nextTrack.id ? track.nextTrack : null;

  function handleOpenLesson(lessonId: string) {
    if (!courseId || !lessonId) return;
    router.push(`/${routeBase}/${courseId}/lessons/${lessonId}`);
  }

  function handleContinueCourse() {
    if (continueLessonId) {
      handleOpenLesson(continueLessonId);
    } else if (nextTrack?.id) {
      router.push(`/${routeBase}/${nextTrack.id}`);
    }
  }

  if (loading) return <CourseDetailLoadingState />;

  if (error || !track) {
    const errorTitle = getErrorStatus(error) === 404 || /not found/i.test(error ?? '')
      ? t('notFoundTitle', { defaultValue: 'Course not found' })
      : t('notAvailableTitle', { defaultValue: 'Course not available' });

    return (
      <CourseDetailErrorState
        title={errorTitle}
        message={error ?? t('notFoundMessage', { defaultValue: 'Track was not found.' })}
        backHref={`/${routeBase}`}
        backLabel={t('backToTracks', { defaultValue: 'Back to tracks' })}
        onRetry={loadCourseDetail}
      />
    );
  }

  return (
    <CourseDetailView
      track={track}
      lessons={lessons}
      continueLessonId={continueLessonId}
      nextTrack={nextTrack}
      from={searchParams.get('from')}
      routeBase={routeBase}
      onBackToTracks={() => router.push(`/${routeBase}`)}
      onContinueCourse={handleContinueCourse}
      onOpenLesson={handleOpenLesson}
    />
  );
}

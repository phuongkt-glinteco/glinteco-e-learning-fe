import CircleMeter from '@/components/ui/CircleMeter';
import { CourseRoadmap } from './CourseRoadmap';
import type { LearnerTrack, TrackLessonPreview } from './types';
import { PageHeader } from '@/components/ui';
import { useTranslations } from 'next-intl';
import { DynamicBreadcrumbs } from '@/components/ui/containers/DynamicBreadcrumbs';

interface CourseDetailViewProps {
  track: LearnerTrack;
  lessons: TrackLessonPreview[];
  continueLessonId: string | null;
  from?: string | null;
  routeBase?: string;
  onBackToTracks: () => void;
  onContinueCourse: () => void;
  onOpenLesson: (lessonId: string) => void;
}

export function CourseDetailView({
  track,
  lessons,
  continueLessonId,
  from,
  routeBase = 'tracks',
  onBackToTracks,
  onContinueCourse,
  onOpenLesson,
}: CourseDetailViewProps) {
  const t = useTranslations('CourseDetailView');
  const progressPercent = track.lessonCount > 0
    ? Math.round((track.lessonsCompleted / track.lessonCount) * 100)
    : 0;
  const isLocked = track.status === 'locked';

  return (
    <section className="mx-auto flex max-w-container-max flex-col gap-6 px-gutter py-8">
      <div className="mb-[-8px]">
        <DynamicBreadcrumbs />
      </div>

      <header className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1fr_220px] lg:items-center">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-fixed px-3 py-1 label-sm text-primary">
              <span className="material-symbols-outlined text-[17px]">
                {track.icon || 'route'}
              </span>
              {isLocked ? 'Course locked' : 'Learning Track'}
            </div>
            <h1 className="headline-lg break-words text-primary">{track.title}</h1>
            <p className="mt-3 max-w-[760px] min-w-0 break-words body-md text-on-surface-variant">
              {track.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-3 label-sm text-on-surface-variant">
              <span className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                {track.estimatedTime}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2">
                <span className="material-symbols-outlined text-[16px]">menu_book</span>
                {track.lessonCount} lessons
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2">
                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                {track.lessonsCompleted} completed
              </span>
            </div>

            {track.lockedReason && (
              <div className="mt-4 rounded-lg border border-outline-variant bg-surface-container-low p-3 body-sm break-words text-on-surface-variant">
                {track.lockedReason}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <CircleMeter value={progressPercent} size={168} label="Completed" />
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px] xl:items-start">
        <CourseRoadmap
          lessons={lessons}
          activeLessonId={continueLessonId}
          disabled={isLocked}
          onOpenLesson={onOpenLesson}
        />

        <aside className="flex flex-col gap-4">
          <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="headline-sm text-on-surface">Next Step</h2>
            {lessons.length > 0 ? (
              <>
                <p className="mt-2 body-sm text-on-surface-variant">
                  Continue to the next lesson that needs your attention.
                </p>
                <button
                  type="button"
                  onClick={onContinueCourse}
                  disabled={isLocked || !continueLessonId}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 label-sm transition-colors ${
                    isLocked || !continueLessonId
                      ? 'cursor-not-allowed bg-surface-container text-outline'
                      : 'cursor-pointer bg-primary text-on-primary hover:opacity-90'
                  }`}
                >
                  {continueLessonId ? 'Continue Course' : 'All Lessons Completed'}
                  {continueLessonId && (
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  )}
                </button>
              </>
            ) : (
              <p className="mt-2 body-sm text-on-surface-variant">No lessons yet.</p>
            )}
          </section>

          <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="headline-sm text-on-surface">Course Progress</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between label-sm text-on-surface-variant">
                <span>Lessons completed</span>
                <span className="text-on-surface">
                  {track.lessonsCompleted}/{track.lessonCount}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </section>

        </aside>
      </div>
    </section>
  );
}

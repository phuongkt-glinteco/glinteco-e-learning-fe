import { Icon } from '@iconify/react';
import HPBar from '@/components/ui/HPBar';
import { StatusBadge, TimeBadge } from '@/components/ui/Badge';
import { CourseRoadmap } from './CourseRoadmap';
import type { LearnerTrack, TrackLessonPreview } from './types';

interface CourseDetailViewProps {
  track: LearnerTrack;
  lessons: TrackLessonPreview[];
  currentLessonId: string | null;
  isUsingMockData: boolean;
  fallbackMessage: string | null;
  onBackToTracks: () => void;
  onOpenLesson: (lessonId: string) => void;
}

export function CourseDetailView({
  track,
  lessons,
  currentLessonId,
  isUsingMockData,
  fallbackMessage,
  onBackToTracks,
  onOpenLesson,
}: CourseDetailViewProps) {
  const progressPercent = track.lessonCount > 0
    ? Math.round((track.lessonsCompleted / track.lessonCount) * 100)
    : 0;

  return (
    <div className="max-w-[960px] mx-auto py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant mb-4">
        <button
          type="button"
          onClick={onBackToTracks}
          className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer"
        >
          <Icon icon="lucide:arrow-left" className="w-3.5 h-3.5" />
          Learning Tracks
        </button>
        <span className="text-outline">/</span>
        <span className="truncate text-on-surface">{track.title}</span>
      </nav>

      {fallbackMessage && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
          {fallbackMessage}
        </div>
      )}

      {/* Track Header */}
      <header className="bg-surface border border-outline-variant rounded-lg p-5 shadow-sm mb-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {isUsingMockData && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Icon icon="lucide:flask-conical" className="w-3.5 h-3.5" />
                  Sample data
                </span>
              )}
              <StatusBadge status={track.status} />
              <TimeBadge time={track.estimatedTime} />
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface-variant">
                <Icon icon="lucide:book-open" className="w-3.5 h-3.5 text-primary" />
                {track.lessonCount} lessons
              </span>
            </div>
            <h1 className="text-xl font-bold text-on-surface">{track.title}</h1>
            <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
              {track.description}
            </p>
          </div>

          {track.lessonCount > 0 && (
            <div className="w-full lg:w-[200px]">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-on-surface-variant">
                  {track.lessonsCompleted}/{track.lessonCount} done
                </span>
                <span className="text-primary">{progressPercent}%</span>
              </div>
              <HPBar value={progressPercent} segments={track.lessonCount * 3} />
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px] lg:items-start">
        <CourseRoadmap
          lessons={lessons}
          activeLessonId={currentLessonId}
          onOpenLesson={onOpenLesson}
        />

        <aside className="flex flex-col gap-4">
          <section className="bg-surface border border-outline-variant rounded-lg p-4 shadow-sm">
            <h2 className="text-sm font-bold text-on-surface mb-2">Course Progress</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                <span>Lessons completed</span>
                <span className="text-on-surface">
                  {track.lessonsCompleted}/{track.lessonCount}
                </span>
              </div>
              <HPBar value={progressPercent} segments={Math.max(track.lessonCount, 4)} />
            </div>
          </section>

          <section className="bg-surface border border-outline-variant rounded-lg p-4 shadow-sm">
            <h2 className="text-sm font-bold text-on-surface mb-1">Exercises</h2>
            <p className="text-xs text-on-surface-variant">
              No assigned exercises for this course yet.
            </p>
          </section>

          <section className="bg-surface border border-outline-variant rounded-lg p-4 shadow-sm">
            <h2 className="text-sm font-bold text-on-surface mb-1">Related Docs</h2>
            <p className="text-xs text-on-surface-variant">
              No related documents for this course yet.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

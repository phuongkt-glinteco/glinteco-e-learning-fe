import { Icon } from '@iconify/react';
import HPBar from '@/components/ui/HPBar';
import { StatusBadge, TimeBadge } from '@/components/ui/Badge';
import type { LearnerLesson, LearnerTrack } from './types';

interface LessonDetailViewProps {
  track: LearnerTrack;
  lessons: LearnerLesson[];
  activeLesson: LearnerLesson;
  isUsingMockData: boolean;
  fallbackMessage: string | null;
  completing: boolean;
  completionMessage: string | null;
  completionError: string | null;
  onBackToTracks: () => void;
  onSelectLesson: (lessonId: string) => void;
  onCompleteLesson: () => void;
}

export function LessonDetailView({
  track,
  lessons,
  activeLesson,
  isUsingMockData,
  fallbackMessage,
  completing,
  completionMessage,
  completionError,
  onBackToTracks,
  onSelectLesson,
  onCompleteLesson,
}: LessonDetailViewProps) {
  const progressPercent = track.lessonCount > 0
    ? Math.round((track.lessonsCompleted / track.lessonCount) * 100)
    : 0;

  return (
    <div className="max-w-[960px] mx-auto py-4">
      {/* Header */}
      <header className="bg-surface border border-outline-variant rounded-lg p-4 shadow-sm flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBackToTracks}
            className="w-9 h-9 border border-outline-variant hover:bg-surface-container-low rounded-lg flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
            aria-label="Back to course"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {track.title}
            </span>
            <h1 className="text-base font-bold text-on-surface truncate">Lesson Detail</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isUsingMockData && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <Icon icon="lucide:flask-conical" className="w-3.5 h-3.5" />
              Sample data
            </span>
          )}
          <StatusBadge status={track.status} />
        </div>
      </header>

      {fallbackMessage && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
          {fallbackMessage}
        </div>
      )}

      {/* XP banner */}
      {completionMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-700 text-sm font-semibold flex items-center gap-2 mb-4">
          <Icon icon="lucide:zap" className="w-4 h-4" />
          {completionMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_240px] gap-4 items-start">
        {/* Lesson Playlist */}
        <aside className="bg-surface border border-outline-variant rounded-lg p-3 shadow-sm flex flex-col gap-3">
          <div className="border-b border-outline-variant pb-2">
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Lessons
            </h2>
            <div className="flex items-center justify-between text-xs font-semibold text-outline mt-1">
              <span>Progress</span>
              <span>
                {track.lessonsCompleted}/{track.lessonCount} done
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 max-h-[480px] overflow-y-auto pr-1">
            {lessons.map((lesson, index) => {
              const isActive = lesson.id === activeLesson.id;
              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => onSelectLesson(lesson.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-md flex items-start gap-2 text-xs font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary/5 text-primary border-primary/20'
                      : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <Icon
                    icon={
                      lesson.completed
                        ? 'lucide:check-circle'
                        : isActive
                          ? 'lucide:play-circle'
                          : 'lucide:circle'
                    }
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      lesson.completed
                        ? 'text-green-600'
                        : isActive
                          ? 'text-primary'
                          : 'text-outline'
                    }`}
                  />
                  <span className="leading-normal flex-1 truncate">
                    {String(index + 1).padStart(2, '0')}. {lesson.title}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="bg-surface border border-outline-variant rounded-lg p-5 shadow-sm flex flex-col gap-4">
          <div className="border-b border-outline-variant pb-3">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded uppercase bg-primary/10 text-primary border border-primary/20">
                Lesson {activeLesson.order}
              </span>
              <TimeBadge time={activeLesson.estimatedTime} />
              {activeLesson.bodySource === 'fallback' && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-50 text-slate-600 border border-slate-200">
                  Draft notes
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Icon icon="lucide:zap" className="w-3 h-3" />
                {activeLesson.xp} XP
              </span>
              {activeLesson.completed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                  <Icon icon="lucide:check" className="w-3 h-3" />
                  Completed
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-on-surface leading-snug">
              {activeLesson.title}
            </h2>
          </div>

          {/* Lesson body — API chưa có GET /lessons/:id nên body rỗng */}
          <article className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">
            {activeLesson.body}
          </article>

          {completionError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-xs font-semibold">
              {completionError}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onCompleteLesson}
              disabled={completing || activeLesson.completed}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-lg transition-colors select-none ${
                activeLesson.completed
                  ? 'bg-surface-container text-outline border border-outline-variant cursor-not-allowed'
                  : 'bg-primary text-white hover:opacity-90 shadow-sm cursor-pointer'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <Icon
                icon={completing ? 'lucide:loader-2' : 'lucide:check-circle'}
                className={`w-4 h-4 ${completing ? 'animate-spin' : ''}`}
              />
              {activeLesson.completed
                ? 'Lesson Completed'
                : completing
                  ? 'Completing...'
                  : 'Complete Lesson'}
            </button>
          </div>
        </main>

        {/* Track Progress Sidebar */}
        <aside className="flex flex-col gap-3">
          <div className="bg-surface border border-outline-variant rounded-lg p-4 shadow-sm flex flex-col items-center gap-2">
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center border-b border-outline-variant w-full pb-2">
              Track Progress
            </h2>
            <div className="w-full py-1">
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-on-surface-variant">{progressPercent}%</span>
                <span className="text-on-surface">
                  {track.lessonsCompleted}/{track.lessonCount}
                </span>
              </div>
              <HPBar value={progressPercent} segments={Math.max(track.lessonCount, 4)} />
            </div>
            <p className="text-xs text-outline text-center leading-normal">
              Finish lessons to unlock the next milestone and claim XP.
            </p>
          </div>

          <div className="bg-surface border border-outline-variant rounded-lg p-4 shadow-sm flex flex-col gap-2">
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant pb-2">
              Track Summary
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {track.description}
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
              <span>Estimated time</span>
              <span className="text-on-surface">{track.estimatedTime}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

import { StatusBadge, TimeBadge } from '@/components/ui';
import CircleMeter from '@/components/ui/CircleMeter';
import { MarkdownRenderer } from '@/lib/md-renderer';
import { DynamicBreadcrumbs } from '@/components/ui/containers/DynamicBreadcrumbs';
import type { LearnerExercise, LearnerLesson, LearnerTrack } from './types';

interface LessonDetailViewProps {
  track: LearnerTrack;
  lessons: LearnerLesson[];
  activeLesson: LearnerLesson;
  previousLessonId: string | null;
  nextLessonId: string | null;
  exercises: LearnerExercise[];
  completing: boolean;
  completionMessage: string | null;
  completionError: string | null;
  onBackToTracks: () => void;
  onSelectLesson: (lessonId: string) => void;
  onOpenExercise: (exerciseId: string) => void;
  onCompleteLesson: () => void;
}

export function LessonDetailView({
  track,
  lessons,
  activeLesson,
  previousLessonId,
  nextLessonId,
  exercises,
  completing,
  completionMessage,
  completionError,
  onBackToTracks,
  onSelectLesson,
  onOpenExercise,
  onCompleteLesson,
}: LessonDetailViewProps) {
  const progressPercent = track.lessonCount > 0
    ? Math.round((track.lessonsCompleted / track.lessonCount) * 100)
    : 0;

  return (
    <div className="mx-auto flex max-w-container-max flex-col gap-6 px-gutter py-8">
      {completionMessage && (
        <div className="flex min-w-0 items-center gap-2 rounded-lg border border-tertiary-container bg-tertiary-fixed/40 p-4 label-sm text-tertiary">
          <span className="material-symbols-outlined text-[18px]">bolt</span>
          <span className="min-w-0 break-words">{completionMessage}</span>
        </div>
      )}

      <div className="mb-[-8px]">
        <DynamicBreadcrumbs />
      </div>

      <header className="bg-surface border border-outline-variant rounded-lg p-4 flex min-w-0 items-center justify-between gap-4 flex-wrap shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBackToTracks}
            className="w-9 h-9 border border-outline-variant hover:bg-surface-container-low rounded-lg flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
            aria-label="Back to course"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
          <div className="min-w-0">
            <span className="label-sm text-primary uppercase">
              Course Lesson
            </span>
            <h1 className="headline-sm line-clamp-2 break-words text-on-surface">{track.title}</h1>
          </div>
        </div>
        <StatusBadge status={track.status} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <aside className="lg:col-span-1 bg-surface border border-outline-variant rounded-lg p-4 shadow-sm flex min-w-0 flex-col gap-4">
          <div className="border-b border-outline-variant pb-3">
            <h2 className="label-sm text-on-surface-variant uppercase">
              Lessons Playlist
            </h2>
            <div className="flex items-center justify-between label-sm text-outline mt-1.5">
              <span>Progress</span>
              <span>
                {track.lessonsCompleted}/{track.lessonCount} done
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[520px] overflow-y-auto pr-1">
            {lessons.map((lesson, index) => {
              const isActive = lesson.id === activeLesson.id;

              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => onSelectLesson(lesson.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-2.5 label-sm border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-primary/5 text-primary border-primary/20 shadow-sm'
                      : 'border-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                      lesson.completed
                        ? 'text-tertiary'
                        : isActive
                          ? 'text-primary'
                          : 'text-outline'
                    }`}
                  >
                    {lesson.completed ? 'check_circle' : isActive ? 'play_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className="min-w-0 flex-1 truncate leading-normal">
                    {String(index + 1).padStart(2, '0')}. {lesson.title}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="lg:col-span-2 bg-surface border border-outline-variant rounded-lg p-6 shadow-sm flex min-w-0 flex-col gap-6">
          <div className="border-b border-outline-variant pb-4">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-primary-container/20 text-primary border border-primary-container/30">
                Lesson {activeLesson.order}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-surface-container text-on-surface-variant border border-outline-variant">
                {activeLesson.type}
              </span>
              <TimeBadge time={activeLesson.estimatedTime} />
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md label-sm bg-surface-container-low text-on-surface-variant border border-outline-variant">
                <span className="material-symbols-outlined text-[16px] text-amber-500">bolt</span>
                {activeLesson.xp} XP
              </span>
              {activeLesson.completed && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded label-sm bg-green-50 text-green-700 border border-green-200">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  Completed
                </span>
              )}
            </div>
            <h2 className="headline-md break-words text-on-surface leading-snug">{activeLesson.title}</h2>
            {activeLesson.description && (
              <p className="mt-2 body-sm break-words text-on-surface-variant">
                {activeLesson.description}
              </p>
            )}
          </div>

          {activeLesson.body.trim() ? (
            <article className="min-w-0 break-words text-on-surface-variant">
              <MarkdownRenderer content={activeLesson.body} />
            </article>
          ) : (
            <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-6">
              <h3 className="headline-sm text-on-surface">Lesson content is not available yet</h3>
              <p className="mt-2 body-sm text-on-surface-variant">
                You can still review the lesson order and mark progress when the API provides content.
              </p>
            </div>
          )}

          <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="headline-sm text-on-surface">Exercises</h3>
              <span className="rounded-full bg-primary-fixed px-3 py-1 label-sm text-primary">
                {exercises.length}
              </span>
            </div>

            {exercises.length > 0 ? (
              <div className="flex flex-col gap-3">
                {exercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => onOpenExercise(exercise.id)}
                    className="rounded-lg border border-outline-variant bg-surface p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-surface-container px-2 py-0.5 label-sm text-on-surface-variant">
                            {exercise.difficulty}
                          </span>
                          <span className="rounded bg-surface-container px-2 py-0.5 label-sm text-on-surface-variant">
                            {exercise.tag}
                          </span>
                          <span className="inline-flex items-center gap-1 label-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-[15px]">schedule</span>
                            {exercise.estimatedTime}
                          </span>
                          <span className="inline-flex items-center gap-1 label-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-[15px]">bolt</span>
                            {exercise.xp} XP
                          </span>
                        </div>
                        <h4 className="mt-2 headline-sm line-clamp-2 break-words text-on-surface">{exercise.title}</h4>
                        <p className="mt-1 body-sm line-clamp-3 break-words text-on-surface-variant">{exercise.brief}</p>
                      </div>
                      <span className="material-symbols-outlined mt-1 shrink-0 text-[18px] text-primary">
                        arrow_forward
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-outline-variant bg-surface p-5">
                <h4 className="headline-sm text-on-surface">No exercises yet</h4>
                <p className="mt-2 body-sm text-on-surface-variant">
                  This lesson does not have linked exercises yet.
                </p>
              </div>
            )}
          </section>

          {completionError && (
            <div className="rounded-lg border border-error-container bg-error-container/40 p-4 text-error label-sm">
              {completionError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => previousLessonId && onSelectLesson(previousLessonId)}
                disabled={!previousLessonId}
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-4 py-2.5 label-sm text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:text-outline disabled:hover:bg-transparent"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Previous
              </button>
              <button
                type="button"
                onClick={() => nextLessonId && onSelectLesson(nextLessonId)}
                disabled={!nextLessonId}
                className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant px-4 py-2.5 label-sm text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:text-outline disabled:hover:bg-transparent"
              >
                Next
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onCompleteLesson}
              disabled={completing || activeLesson.completed}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 label-sm rounded-lg transition-colors select-none ${
                activeLesson.completed
                  ? 'bg-surface-container text-outline border border-outline-variant cursor-not-allowed'
                  : 'bg-primary text-on-primary hover:opacity-90 shadow-sm cursor-pointer'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {completing ? 'progress_activity' : 'check_circle'}
              </span>
              {activeLesson.completed
                ? 'Lesson Completed'
                : completing
                  ? 'Completing...'
                  : 'Complete Lesson'}
            </button>
          </div>
        </main>

        <aside className="lg:col-span-1 flex min-w-0 flex-col gap-6">
          <div className="bg-surface border border-outline-variant rounded-lg p-5 shadow-sm flex flex-col items-center gap-3">
            <h2 className="label-sm text-on-surface-variant uppercase text-center border-b border-outline-variant w-full pb-2">
              Track Progress
            </h2>
            <div className="py-2">
              <CircleMeter value={progressPercent} size={144} label="Completed" />
            </div>
            <p className="label-sm text-outline text-center leading-normal">
              Finish lessons to unlock the next milestone and claim XP.
            </p>
          </div>

          <div className="bg-surface border border-outline-variant rounded-lg p-5 shadow-sm flex min-w-0 flex-col gap-3">
            <h2 className="label-sm text-on-surface-variant uppercase border-b border-outline-variant pb-2">
              Track Summary
            </h2>
            <p className="body-sm break-words text-on-surface-variant leading-relaxed">
              {track.description}
            </p>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 label-sm text-on-surface-variant">
              <span>Estimated time</span>
              <span className="min-w-0 break-words text-on-surface">{track.estimatedTime}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

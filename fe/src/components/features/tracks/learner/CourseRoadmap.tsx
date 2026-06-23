import type { TrackLessonPreview } from './types';

interface CourseRoadmapProps {
  lessons: TrackLessonPreview[];
  activeLessonId: string | null;
  disabled: boolean;
  onOpenLesson: (lessonId: string) => void;
}

function getLessonState(lesson: TrackLessonPreview, activeLessonId: string | null) {
  if (lesson.completed) return 'completed';
  if (lesson.id === activeLessonId) return 'current';
  return 'upcoming';
}

export function CourseRoadmap({
  lessons,
  activeLessonId,
  disabled,
  onOpenLesson,
}: CourseRoadmapProps) {
  if (lessons.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center">
        <h2 className="headline-sm text-on-surface">No lessons available</h2>
        <p className="mt-2 body-sm text-on-surface-variant">
          This course does not have published lessons yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="headline-sm text-on-surface">Course Roadmap</h2>
          <p className="mt-1 body-sm text-on-surface-variant">
            Follow the lessons in order and continue from your current step.
          </p>
        </div>
        <span className="hidden rounded-full bg-primary-fixed px-3 py-1 label-sm text-primary sm:inline-flex">
          {lessons.length} lessons
        </span>
      </div>

      <div className="relative flex flex-col gap-4">
        <div className="absolute bottom-6 left-[23px] top-6 w-px bg-outline-variant" />

        {lessons.map((lesson) => {
          const state = getLessonState(lesson, activeLessonId);
          const isCurrent = state === 'current';
          const isCompleted = state === 'completed';

          return (
            <article
              key={lesson.id}
              className={`relative grid grid-cols-[48px_1fr] gap-4 rounded-lg border p-4 transition-colors ${
                isCurrent
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant bg-surface'
              }`}
            >
              <div className={`z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-surface ${
                isCompleted
                  ? 'bg-green-600 text-white'
                  : isCurrent
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-outline'
              }`}>
                <span className="material-symbols-outlined text-[22px]">
                  {isCompleted ? 'check' : isCurrent ? 'play_arrow' : 'radio_button_unchecked'}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-surface-container px-2 py-0.5 label-sm text-on-surface-variant">
                    Lesson {lesson.order}
                  </span>
                  <span className="inline-flex items-center gap-1 label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[15px]">schedule</span>
                    {lesson.estimatedTime}
                  </span>
                </div>
                <h3 className="mt-2 headline-sm text-on-surface">{lesson.title}</h3>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenLesson(lesson.id)}
                    disabled={disabled}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 label-sm transition-colors ${
                      disabled
                        ? 'cursor-not-allowed bg-surface-container text-outline'
                        : isCurrent
                          ? 'cursor-pointer bg-primary text-on-primary hover:opacity-90'
                          : 'cursor-pointer border border-outline-variant text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Open'}
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

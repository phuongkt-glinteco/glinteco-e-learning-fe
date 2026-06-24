import { Icon } from '@iconify/react';
import type { TrackLessonPreview } from './types';

interface CourseRoadmapProps {
  lessons: TrackLessonPreview[];
  activeLessonId: string | null;
  onOpenLesson: (lessonId: string) => void;
}

export function CourseRoadmap({ lessons, activeLessonId, onOpenLesson }: CourseRoadmapProps) {
  if (lessons.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center">
        <Icon icon="lucide:book-x" className="w-8 h-8 mx-auto text-outline mb-2" />
        <h3 className="text-sm font-bold text-on-surface">No lessons available</h3>
        <p className="text-xs text-on-surface-variant mt-1">
          This course does not have published lessons yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-outline-variant rounded-lg p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-on-surface">Course Roadmap</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Follow the lessons in order and continue from your current step.
          </p>
        </div>
        <span className="hidden sm:inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {lessons.length} lessons
        </span>
      </div>

      <div className="relative flex flex-col gap-3">
        {lessons.map((lesson, idx) => {
          const isCurrent = lesson.id === activeLessonId && !lesson.completed;
          const isCompleted = lesson.completed;

          return (
            <article
              key={lesson.id}
              className={`relative grid grid-cols-[44px_1fr] gap-3 rounded-lg border p-3 transition-colors ${
                isCurrent
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant bg-surface'
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isCurrent
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-outline'
                }`}
              >
                <Icon
                  icon={
                    isCompleted
                      ? 'lucide:check'
                      : isCurrent
                        ? 'lucide:play'
                        : 'lucide:circle'
                  }
                  className="w-5 h-5"
                />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-surface-container px-2 py-0.5 text-xs font-semibold text-on-surface-variant">
                    Lesson {lesson.order}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface-variant">
                    <Icon icon="lucide:clock" className="w-3 h-3" />
                    {lesson.estimatedTime}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-bold text-on-surface">{lesson.title}</h3>

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onOpenLesson(lesson.id)}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                      isCurrent
                        ? 'bg-primary text-white hover:opacity-90 cursor-pointer'
                        : 'border border-outline-variant text-on-surface hover:bg-surface-container-low cursor-pointer'
                    }`}
                  >
                    {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Open'}
                    <Icon icon="lucide:arrow-right" className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Connector line */}
              {idx < lessons.length - 1 && (
                <div className="absolute left-[22px] top-[52px] h-[calc(100%-8px)] w-px bg-outline-variant" />
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

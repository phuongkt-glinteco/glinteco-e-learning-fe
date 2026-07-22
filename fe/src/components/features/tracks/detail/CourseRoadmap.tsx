'use client';

import { useTranslations } from 'next-intl';

// Define the lesson type to match what the learner view passes
export type RoadmapLesson = {
  id: string;
  title: string;
  description?: string | null;
  body?: string | null;
  estimatedTime?: string;
  completed?: boolean;
};

interface CourseRoadmapProps {
  lessons: RoadmapLesson[];
  activeLessonId?: string | null;
  disabled?: boolean;
  onOpenLesson?: (lessonId: string) => void;
}

export function CourseRoadmap({ lessons = [], activeLessonId, disabled, onOpenLesson }: CourseRoadmapProps) {
  const t = useTranslations('CourseRoadmap');

  return (
    <section className="bg-surface border border-outline-variant rounded-xl p-gutter shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-headline-md text-headline-md text-primary">
          {t?.('title') || 'Course Roadmap'}
        </h2>
        <span className="text-label-sm text-outline">
          {lessons.length} {lessons.length === 1 ? t?.('lesson') || 'Lesson' : t?.('lessons') || 'Lessons'}
        </span>
      </div>

      {lessons.length === 0 ? (
        <div className="py-12 text-center text-secondary body-sm border border-dashed border-outline-variant rounded-lg">
          {t?.('noLessons') || 'No lessons added to this track yet.'}
        </div>
      ) : (
        <div className="relative">
          {/* Vertical Connection Line */}
          {lessons.length > 1 && (
            <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-outline-variant z-0"></div>
          )}

          <div className="flex flex-col gap-6">
            {lessons.map((lesson, index) => {
              // Determine status based on progress
              const isCompleted = lesson.completed;
              // Active is either explicitly matching activeLessonId, or if no progress tracking exists, fallback to first
              const isActive = activeLessonId 
                ? lesson.id === activeLessonId 
                : (!activeLessonId && index === 0);
              
              // A lesson is locked if we are tracking progress, the track isn't completely disabled, it's not completed, and not active
              // But for UI preview simplicity, if it's disabled track, all are locked.
              const isLocked = disabled || (!isCompleted && !isActive);

              return (
                <div key={lesson.id || index} className="relative flex gap-4 items-center group">
                  {/* Step Indicator */}
                  <div className="relative z-10 shrink-0">
                    {isActive ? (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ring-4 ring-background shadow-sm">
                        <span className="material-symbols-outlined text-[18px] text-white">
                          play_arrow
                        </span>
                      </div>
                    ) : isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center ring-4 ring-background shadow-sm">
                        <span className="material-symbols-outlined text-[18px] text-white">
                          check
                        </span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center ring-4 ring-background">
                        <span className="material-symbols-outlined text-[18px] text-secondary">
                          lock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Lesson Card */}
                  <div 
                    onClick={() => {
                      if (!isLocked && onOpenLesson) {
                        onOpenLesson(lesson.id);
                      }
                    }}
                    className={`flex-1 rounded-lg p-5 transition-all ${
                      isActive 
                        ? 'bg-surface-container-lowest border-2 border-primary shadow-md cursor-pointer' 
                        : isCompleted
                        ? 'bg-surface-container-lowest border border-outline-variant shadow-sm hover:border-primary/50 cursor-pointer'
                        : 'bg-surface-container-lowest border border-outline-variant shadow-sm opacity-70 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className={`font-headline-sm text-[18px] leading-[26px] ${isActive || isCompleted ? 'text-primary font-bold' : 'text-on-surface-variant font-semibold'}`}>
                        {index + 1}. {lesson.title || 'Untitled Lesson'}
                      </h3>
                      {isActive && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-label-sm font-label-sm uppercase tracking-wider shrink-0">
                          {t?.('upNext') || 'Up Next'}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-label-sm font-label-sm uppercase tracking-wider shrink-0">
                          {t?.('completed') || 'Completed'}
                        </span>
                      )}
                    </div>
                    <p className={`font-body-sm text-body-sm mb-4 whitespace-pre-line ${isActive || isCompleted ? 'text-on-surface-variant' : 'text-secondary'}`}>
                      {lesson.description || lesson.body || 'No content description.'}
                    </p>
                    <div className={`flex items-center gap-4 text-label-sm ${isActive || isCompleted ? 'text-outline' : 'text-outline/80'}`}>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          play_circle
                        </span>
                        <span>{lesson.estimatedTime || '0m'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          article
                        </span>
                        <span>3 {t?.('resources') || 'Resources'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

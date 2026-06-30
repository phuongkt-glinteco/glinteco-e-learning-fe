import type { TrackLessonPreview } from './types';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';

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
      <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center shadow-sm">
        <h2 className="headline-sm text-on-surface">No lessons yet</h2>
        <p className="mt-2 body-sm text-on-surface-variant">
          This course does not have published lessons yet.
        </p>
      </div>
    );
  }

  return (
    <section className="bg-surface border border-outline-variant rounded-xl p-5 sm:p-gutter shadow-sm">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">
            Course Roadmap
          </h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Follow the lessons in order and continue from your current step.
          </p>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-semibold">
          {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
        </Badge>
      </div>

      <div className="relative">
        {/* Vertical Connection Line */}
        {lessons.length > 1 && (
          <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-outline-variant/60 -ml-[1px] z-0"></div>
        )}

        <div className="flex flex-col gap-6">
          {lessons.map((lesson) => {
            const state = getLessonState(lesson, activeLessonId);
            const isCurrent = state === 'current';
            const isCompleted = state === 'completed';

            return (
              <div key={lesson.id} className="relative flex gap-4 items-start">
                {/* Step Indicator */}
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 shrink-0 ring-4 ring-surface ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isCurrent
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-lowest border border-outline-variant text-secondary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isCompleted ? 'check' : isCurrent ? 'play_arrow' : 'lock'}
                  </span>
                </div>

                {/* Lesson Card */}
                <div
                  className={`flex-1 rounded-lg p-5 transition-all shadow-sm ${
                    isCurrent
                      ? 'bg-primary/5 border-2 border-primary ring-1 ring-primary/10'
                      : 'bg-surface-container-lowest border border-outline-variant opacity-80 hover:opacity-100 hover:border-primary/40'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                    <h3 className={`font-headline-sm text-[18px] leading-[26px] font-bold ${isCurrent ? 'text-primary' : 'text-on-surface'}`}>
                      {lesson.order}. {lesson.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-surface-container text-on-surface-variant uppercase text-[10px]">
                        {lesson.type}
                      </Badge>
                      {isCurrent && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary px-2 py-1 uppercase text-[10px] tracking-wider shrink-0 border-none">
                          Up Next
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {lesson.description && (
                    <p className={`font-body-sm text-sm mb-4 whitespace-pre-line ${isCurrent ? 'text-on-surface-variant' : 'text-secondary'}`}>
                      {lesson.description}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-outline-variant/30">
                    <div className="flex items-center gap-4 text-sm text-outline font-medium">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">
                          schedule
                        </span>
                        <span>{lesson.estimatedTime || '0m'}</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => onOpenLesson(lesson.id)}
                      disabled={disabled && !isCompleted && !isCurrent}
                      variant={isCurrent ? 'default' : 'outline'}
                      className={`flex items-center gap-1.5 h-9 px-4 ${isCurrent ? 'shadow-md' : ''}`}
                    >
                      {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Locked'}
                      <span className="material-symbols-outlined text-[16px]">
                        {isCompleted || isCurrent ? 'arrow_forward' : 'lock'}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

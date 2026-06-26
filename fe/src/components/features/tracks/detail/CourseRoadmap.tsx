'use client';

import { useTranslations } from 'next-intl';
import type { LessonProgressItemDto } from '@/services/api-client';

type RoadmapLesson = LessonProgressItemDto & {
  description?: string | null;
  body?: string | null;
  estimatedTime?: string;
};

interface CourseRoadmapProps {
  lessons: RoadmapLesson[];
}

export function CourseRoadmap({ lessons = [] }: CourseRoadmapProps) {
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
            <div className="absolute left-4 top-4 bottom-4 w-[2px] bg-outline-variant -ml-[1px]"></div>
          )}

          <div className="flex flex-col gap-6">
            {lessons.map((lesson, index) => {
              const isFirst = index === 0;

              return (
                <div key={lesson.id || index} className="relative flex gap-4 items-start">
                  {/* Step Indicator */}
                  {isFirst ? (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center relative z-10 shrink-0 ring-4 ring-background">
                      <span className="material-symbols-outlined text-[18px] text-white">
                        play_arrow
                      </span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center relative z-10 shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-secondary">
                        lock
                      </span>
                    </div>
                  )}

                  {/* Lesson Card */}
                  {isFirst ? (
                    <div className="flex-1 bg-surface-container-lowest rounded-lg p-5 border-2 border-primary shadow-md">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-headline-sm text-[18px] leading-[26px] text-primary font-bold">
                          {index + 1}. {lesson.title || 'Untitled Lesson'}
                        </h3>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-label-sm font-label-sm uppercase tracking-wider shrink-0">
                          {t?.('upNext') || 'Up Next'}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 whitespace-pre-line">
                        {lesson.description || lesson.body || 'No content description.'}
                      </p>
                      <div className="flex items-center gap-4 text-label-sm text-outline">
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
                  ) : (
                    <div className="flex-1 bg-surface-container-lowest rounded-lg p-4 border border-outline-variant shadow-sm opacity-70">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h3 className="font-headline-sm text-[16px] leading-[24px] text-on-surface-variant">
                          {index + 1}. {lesson.title || 'Untitled Lesson'}
                        </h3>
                      </div>
                      <p className="font-body-sm text-body-sm text-secondary mb-3 whitespace-pre-line">
                        {lesson.description || lesson.body || 'No content description.'}
                      </p>
                      <div className="flex items-center gap-4 text-label-sm text-outline opacity-80">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">
                            play_circle
                          </span>
                          <span>{lesson.estimatedTime || '0m'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

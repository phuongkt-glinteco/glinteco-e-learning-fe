'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/lib/md-renderer';
import { CollapsibleBlock } from './GuideView';
import type { ResourceRefLike, TutorialContent, TutorialStep } from './types';

export function TutorialContentBlock({ content }: { content: TutorialContent }) {
  const t = useTranslations('DocumentDetail');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const stepsArr = Array.isArray(content.steps) ? content.steps : (content.legacySteps || []);
  const stepsMarkdown = typeof content.steps === 'string' ? content.steps : (content.explanation || '');
  const prerequisites = content.prerequisites || [];
  const learningObjectives = content.learningObjectives || [];
  const exercises = content.exercises || [];
  const summary = content.summary;

  function getResourceMeta(resource: ResourceRefLike) {
    if (typeof resource === 'string') {
      return {
        id: resource.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)?.[0] || '',
        label: resource,
      };
    }

    return {
      id: resource.id || '',
      label: resource.title || resource.name || resource.id,
    };
  }

  const totalSteps = stepsArr.length;
  const doneSteps = completedSteps.size;
  const progress = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  if (
    !stepsMarkdown &&
    totalSteps === 0 &&
    learningObjectives.length === 0 &&
    prerequisites.length === 0 &&
    exercises.length === 0 &&
    !summary
  ) {
    return <p className="text-on-surface-variant italic py-20 text-center">No content available.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Meta Stats Row: Duration & Difficulty */}
      {(content.duration || content.difficulty) && (
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/70">
          {content.duration && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50">
              <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
              <span className="text-sm font-semibold text-on-surface">
                {t('duration')}: <span className="text-primary">{content.duration} mins</span>
              </span>
            </div>
          )}
          {content.difficulty && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50">
              <span className="material-symbols-outlined text-warning text-[20px]">signal_cellular_alt</span>
              <span className="text-sm font-semibold text-on-surface">
                {t('difficulty')}: <span className="text-on-surface font-bold">{content.difficulty}</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Learning Objectives */}
      {learningObjectives.length > 0 && (
        <CollapsibleBlock
          id="tutorial-objectives"
          title={t('learningObjectives')}
          icon="school"
          iconColorClass="text-primary font-bold"
          borderClass="border-primary/40 border-l-4 border-l-primary"
          bgClass="bg-primary-container/10"
          t={t}
        >
          <ul className="space-y-2.5 pt-2">
            {learningObjectives.map((obj, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5 flex-shrink-0">
                  check_circle
                </span>
                <span className="text-on-surface font-medium text-body-md leading-relaxed">{obj}</span>
              </li>
            ))}
          </ul>
        </CollapsibleBlock>
      )}

      {/* Prerequisites Block */}
      {prerequisites.length > 0 && (
        <section id="tutorial-prerequisites" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm scroll-mt-28">
          <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-3 mb-4 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[22px]">checklist</span>
            <span className="font-bold tracking-tight">{t('prerequisites')}</span>
          </h3>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prerequisites.map((reqItem, idx) => {
              const { id, label } = getResourceMeta(reqItem);
              const href = id ? `/documents/${id}` : `/documents?search=${encodeURIComponent(label)}`;

              return (
                <li key={idx}>
                  <a
                    href={href}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-low border border-outline-variant/70 text-primary font-semibold hover:bg-surface-container hover:border-primary hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-[20px] text-primary group-hover:scale-110 transition-transform">article</span>
                      <span className="truncate text-sm">{label}</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary transition-colors">arrow_forward</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Markdown Steps / Content */}
      {stepsMarkdown && (
        <CollapsibleBlock
          id="tutorial-steps"
          title={t('steps')}
          icon="format_list_numbered"
          iconColorClass="text-primary font-bold"
          borderClass="border-outline-variant border-l-4 border-l-primary"
          bgClass="bg-surface-container-lowest"
          t={t}
        >
          <div className="prose max-w-none text-on-surface-variant pt-2">
            <MarkdownRenderer content={stepsMarkdown} />
          </div>
        </CollapsibleBlock>
      )}

      {/* Array / Legacy Checkbox Steps */}
      {totalSteps > 0 && (
        <section id="tutorial-interactive-steps" className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-6 shadow-sm scroll-mt-28">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/60">
            <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2.5 font-bold tracking-tight">
              <span className="material-symbols-outlined text-primary text-[22px]">playlist_add_check</span>
              <span>{t('progress')}</span>
            </h3>
            <span className="font-bold text-primary text-sm px-2.5 py-1 rounded-full bg-primary/10">{progress}%</span>
          </div>

          <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs font-semibold text-on-surface-variant">{doneSteps}/{totalSteps} {t('stepsCompleted')}</p>

          <div className="space-y-4 pt-2">
            {stepsArr.map((step: TutorialStep, index: number) => {
              const isCompleted = completedSteps.has(index);
              return (
                <div
                  key={index}
                  id={`step-${index + 1}`}
                  className={`bg-surface-container-low rounded-xl border border-outline-variant p-5 shadow-sm transition-all hover:border-primary/60 ${
                    isCompleted ? 'opacity-60 bg-surface-container-lowest' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 pt-0.5">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleStep(index)}
                        className="step-checkbox w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <label
                        onClick={() => toggleStep(index)}
                        className={`font-headline-sm text-base font-bold text-on-surface cursor-pointer select-none block mb-2 ${
                          isCompleted ? 'line-through text-on-surface-variant' : ''
                        }`}
                      >
                        {t('step')} {index + 1}: {step.title || `${t('step')} ${index + 1}`}
                      </label>
                      {step.body && (
                        <div className="font-body-md text-sm text-on-surface-variant leading-relaxed">
                          <MarkdownRenderer content={step.body} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Practice Exercises */}
      {exercises.length > 0 && (
        <CollapsibleBlock
          id="tutorial-exercises"
          title={t('exercises')}
          icon="fitness_center"
          iconColorClass="text-warning font-bold"
          borderClass="border-warning/40 border-l-4 border-l-warning"
          bgClass="bg-warning-container/10"
          t={t}
        >
          <ul className="space-y-3 pt-2">
            {exercises.map((ex, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60">
                <span className="material-symbols-outlined text-warning text-[20px] mt-0.5 flex-shrink-0">
                  assignment
                </span>
                <span className="text-on-surface font-medium text-sm leading-relaxed">{ex}</span>
              </li>
            ))}
          </ul>
        </CollapsibleBlock>
      )}

      {/* Summary */}
      {summary && (
        <CollapsibleBlock
          id="tutorial-summary"
          title={t('summary')}
          icon="emoji_events"
          iconColorClass="text-tertiary font-bold"
          borderClass="border-tertiary/40 border-l-4 border-l-tertiary"
          bgClass="bg-tertiary-container/10"
          t={t}
        >
          <div className="prose max-w-none text-on-surface text-body-lg leading-relaxed pt-1">
            <MarkdownRenderer content={summary} />
          </div>
        </CollapsibleBlock>
      )}
    </div>
  );
}

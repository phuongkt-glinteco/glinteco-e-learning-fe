'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/lib/md-renderer';
import type { TutorialContent } from './types';

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

  const steps = Array.isArray(content.steps) ? content.steps : (content.legacySteps || []);
  const totalSteps = steps.length;
  const doneSteps = completedSteps.size;
  const progress = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  return (
    <div className="space-y-lg">
      {content.explanation && (
        <section className="bg-surface-container-low border border-outline-variant rounded-xl p-lg">
          <p className="text-body-lg text-on-surface-variant">{content.explanation}</p>
        </section>
      )}

      {totalSteps > 0 && (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-on-surface">{t('progress')}</span>
            <span className="font-bold text-primary">{progress}%</span>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-on-surface-variant mt-2">{doneSteps}/{totalSteps} {t('stepsCompleted')}</p>
        </section>
      )}

      <div className="space-y-md">
        {steps.map((step: any, index: number) => {
          const isCompleted = completedSteps.has(index);
          return (
            <div key={index} id={`step-${index + 1}`} className={`bg-white rounded-xl border border-outline-variant p-lg shadow-sm relative transition-all hover:border-primary ${isCompleted ? 'opacity-60' : ''}`}>
              <div className="flex gap-md">
                <div className="flex-shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => toggleStep(index)}
                    className="step-checkbox w-6 h-6 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                </div>
                <div className="flex-grow">
                  <label className="font-headline-sm text-headline-sm text-on-surface cursor-pointer select-none">
                    Step {index + 1}: {step.title || `Step ${index + 1}`}
                  </label>
                  {step.body && (
                    <div className="font-body-md text-body-md text-on-surface-variant mt-sm">
                      <MarkdownRenderer content={step.body} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from '@/lib/md-renderer';
import type { RunbookContent } from './types';

export function RunbookContentBlock({ content, documentTitle }: { content: RunbookContent; documentTitle: string }) {
  const t = useTranslations('DocumentDetail');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (phaseIdx: number, stepIdx: number) => {
    const key = `${phaseIdx}-${stepIdx}`;
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const phases = content.phases || [];
  const totalSteps = phases.reduce((sum, p) => sum + (p.steps?.length || 0), 0);
  const doneSteps = phases.reduce((sum, p, pi) => sum + (p.steps || []).filter((_, si) => completedSteps.has(`${pi}-${si}`)).length, 0);
  const progress = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  return (
    <div className="space-y-lg">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl bg-error-container p-lg border border-error/20">
        <div className="absolute top-0 right-0 p-lg opacity-10">
          <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: '"FILL" 1' }}>warning</span>
        </div>
        <div className="relative z-10 flex flex-col gap-md">
          <div className="flex items-center gap-sm">
            <span className="bg-error text-on-error px-3 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>emergency</span>
              {content.severity || 'CRITICAL'}
            </span>
            {content.incidentId && (
              <span className="text-on-error-container font-label-sm opacity-70">{content.incidentId}</span>
            )}
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-error-container">
            {documentTitle || 'Runbook'}
          </h1>
          <p className="font-body-lg text-body-lg text-on-error-container max-w-2xl">{content.background || content.trigger || 'No description provided.'}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md mt-md">
            <div className="bg-white/50 backdrop-blur p-md rounded-lg">
              <p className="text-label-sm text-on-error-container font-semibold uppercase tracking-wider">Est. Resolution Time</p>
              <p className="text-headline-sm font-headline-sm text-error">{content.estimatedTime || '—'}</p>
            </div>
            <div className="bg-white/50 backdrop-blur p-md rounded-lg">
              <p className="text-label-sm text-on-error-container font-semibold uppercase tracking-wider">Primary Symptoms</p>
              {content.symptoms && content.symptoms.length > 0 ? (
                <ul className="text-body-sm list-disc list-inside text-on-error-container">
                  {content.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              ) : (
                <p className="text-body-sm text-on-error-container">—</p>
              )}
            </div>
            <div className="bg-white/50 backdrop-blur p-md rounded-lg">
              <p className="text-label-sm text-on-error-container font-semibold uppercase tracking-wider">Current Status</p>
              <div className="flex items-center gap-xs mt-xs">
                <div className="w-3 h-3 bg-error rounded-full animate-pulse" />
                <span className="font-label-md text-error">{content.status || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metadata */}
      {(content.incidentId || content.estimatedTime || content.status) && (
        <section className="grid grid-cols-3 gap-md bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
          {content.incidentId && (
            <div>
              <span className="text-xs text-on-surface-variant font-medium">Incident ID</span>
              <p className="text-sm font-semibold text-on-surface font-code mt-0.5">{content.incidentId}</p>
            </div>
          )}
          {content.estimatedTime && (
            <div>
              <span className="text-xs text-on-surface-variant font-medium">Estimated MTTR</span>
              <p className="text-sm font-semibold text-on-surface mt-0.5">{content.estimatedTime}</p>
            </div>
          )}
          {content.status && (
            <div>
              <span className="text-xs text-on-surface-variant font-medium">Status</span>
              <p className="text-sm font-semibold text-on-surface mt-0.5 capitalize">{content.status}</p>
            </div>
          )}
        </section>
      )}

      {/* Symptoms */}
      {content.symptoms && content.symptoms.length > 0 && (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
          <h3 className="font-title-md text-title-md text-on-surface mb-md flex items-center gap-sm">
            <span className="material-symbols-outlined text-error">medical_information</span>
            Symptoms & Indicators
          </h3>
          <ul className="list-disc list-inside space-y-sm text-body-md text-on-surface-variant">
            {content.symptoms.map((sym, idx) => (
              <li key={idx}>{sym}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Progress Bar */}
      {totalSteps > 0 && (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md">
          <div className="flex items-center justify-between mb-sm">
            <span className="text-sm font-semibold text-on-surface">Execution Progress</span>
            <span className="text-sm font-bold text-primary">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-on-surface-variant mt-2">{doneSteps}/{totalSteps} steps completed</p>
        </section>
      )}

      {/* Phases */}
      {phases.map((phase, pIndex) => (
        <section key={pIndex} id={phase.name.toLowerCase().replace(/\s+/g, '-')} className="space-y-md">
          <div className="flex items-center gap-md">
            <div className={pIndex === 0 ? 'bg-surface-container-high p-sm rounded-lg' : 'bg-primary text-on-primary p-sm rounded-lg'}>
              <span className="material-symbols-outlined">{pIndex === 0 ? 'analytics' : 'bolt'}</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Phase {String(pIndex + 1).padStart(2, '0')}: {phase.name}
            </h2>
          </div>

          {(phase.steps || []).length === 0 && (
            <p className="font-body-md text-body-md text-on-surface-variant mb-md">
              {phase.name ? `Verify the situation before proceeding.` : ''}
            </p>
          )}

          <div className="space-y-md">
            {(phase.steps || []).map((step: any, sIndex: number) => {
              const key = `${pIndex}-${sIndex}`;
              const isCompleted = completedSteps.has(key);
              return (
                <div key={sIndex} id={`${phase.name.toLowerCase().replace(/\s+/g, '-')}-step-${sIndex + 1}`} className={`bg-white rounded-xl border border-outline-variant p-lg shadow-sm relative transition-all hover:border-primary ${isCompleted ? 'opacity-60' : ''}`}>
                  <div className="flex gap-md">
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => toggleStep(pIndex, sIndex)}
                        className="step-checkbox w-6 h-6 rounded border-outline-variant text-primary focus:ring-primary"
                      />
                    </div>
                    <div className="flex-grow">
                      <label className="font-headline-sm text-headline-sm text-on-surface cursor-pointer select-none">
                        Step {sIndex + 1}: {step.title || `Step ${sIndex + 1}`}
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
        </section>
      ))}

      {/* Close Incident Button */}
      <button className="mt-lg w-full py-md bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary-container transition-all active:scale-[0.98]">
        CLOSE INCIDENT & GENERATE REPORT
      </button>
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';

interface Step {
  title: string;
  body: string;
}

interface Phase {
  name: string;
  steps: Step[];
}

interface DocumentProceduralEditorProps {
  kind: 'Tutorial' | 'Runbook';
  explanationOrBackground: string;
  onExplanationOrBackgroundChange: (value: string) => void;
  steps?: Step[];
  onStepsChange?: (steps: Step[]) => void;
  phases?: Phase[];
  onPhasesChange?: (phases: Phase[]) => void;
  // Runbook metadata
  severity?: string;
  onSeverityChange?: (value: string) => void;
  incidentId?: string;
  onIncidentIdChange?: (value: string) => void;
  estimatedTime?: string;
  onEstimatedTimeChange?: (value: string) => void;
  symptoms?: string[];
  onSymptomsChange?: (value: string[]) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
}

export function DocumentProceduralEditor({
  kind,
  explanationOrBackground,
  onExplanationOrBackgroundChange,
  steps = [],
  onStepsChange,
  phases = [],
  onPhasesChange,
  severity,
  onSeverityChange,
  incidentId,
  onIncidentIdChange,
  estimatedTime,
  onEstimatedTimeChange,
  symptoms = [],
  onSymptomsChange,
  status,
  onStatusChange,
}: DocumentProceduralEditorProps) {
  const t = useTranslations('DocumentEdit');

  if (kind === 'Tutorial') {
    return (
      <div className="space-y-6">
        <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
          <h3 className="font-label-md text-on-surface mb-4 border-b border-outline-variant pb-2">
            {t('explanation')}
          </h3>
          <textarea
            value={explanationOrBackground}
            onChange={(e) => onExplanationOrBackgroundChange(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            rows={6}
            placeholder={t('explanationPlaceholder')}
          />
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
            <h3 className="font-label-md text-on-surface">{t('steps')}</h3>
            <button
              type="button"
              onClick={() => onStepsChange?.([...steps, { title: '', body: '' }])}
              className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-sm hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              {t('addStep')}
            </button>
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="border border-outline-variant rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-on-surface-variant">
                    {t('step')} {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => onStepsChange?.(steps.filter((_, i) => i !== index))}
                    className="text-error hover:opacity-80 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
                <input
                  value={step.title}
                  onChange={(e) => {
                    const updated = [...steps];
                    updated[index] = { ...step, title: e.target.value };
                    onStepsChange?.(updated);
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary mb-2"
                  placeholder={t('stepTitlePlaceholder')}
                />
                <textarea
                  value={step.body}
                  onChange={(e) => {
                    const updated = [...steps];
                    updated[index] = { ...step, body: e.target.value };
                    onStepsChange?.(updated);
                  }}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  rows={4}
                  placeholder={t('stepBodyPlaceholder')}
                />
              </div>
            ))}
            {steps.length === 0 && (
              <p className="text-label-sm text-on-surface-variant opacity-50 text-center py-8">
                {t('noStepsYet')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Runbook Metadata Section */}
      <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
        <h3 className="font-label-md text-on-surface mb-4 border-b border-outline-variant pb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[20px]">emergency</span>
          Incident Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-label-sm text-on-surface-variant mb-1.5">Severity</label>
            <select
              value={severity || ''}
              onChange={(e) => onSeverityChange?.(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Select severity...</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
          <div>
            <label className="block font-label-sm text-on-surface-variant mb-1.5">Incident ID</label>
            <input
              value={incidentId || ''}
              onChange={(e) => onIncidentIdChange?.(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="e.g. RUNBOOK-042-PSQL"
            />
          </div>
          <div>
            <label className="block font-label-sm text-on-surface-variant mb-1.5">Est. Resolution Time</label>
            <input
              value={estimatedTime || ''}
              onChange={(e) => onEstimatedTimeChange?.(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="e.g. 15 Minutes"
            />
          </div>
          <div>
            <label className="block font-label-sm text-on-surface-variant mb-1.5">Current Status</label>
            <input
              value={status || ''}
              onChange={(e) => onStatusChange?.(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="e.g. Outage in Progress"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block font-label-sm text-on-surface-variant mb-1.5">Primary Symptoms (one per line)</label>
          <textarea
            value={symptoms.join('\n')}
            onChange={(e) => onSymptomsChange?.(e.target.value.split('\n').filter((s) => s.trim()))}
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            rows={3}
            placeholder="500 Errors in Gateway&#10;DB Connection Refused"
          />
        </div>
      </div>

      <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
        <h3 className="font-label-md text-on-surface mb-4 border-b border-outline-variant pb-2">
          {t('background')}
        </h3>
        <textarea
          value={explanationOrBackground}
          onChange={(e) => onExplanationOrBackgroundChange(e.target.value)}
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary resize-none"
          rows={6}
          placeholder={t('backgroundPlaceholder')}
        />
      </div>

      <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-2">
          <h3 className="font-label-md text-on-surface">{t('phases')}</h3>
          <button
            type="button"
            onClick={() => onPhasesChange?.([...phases, { name: '', steps: [] }])}
            className="px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label-sm hover:opacity-90 transition-opacity flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            {t('addPhase')}
          </button>
        </div>
        <div className="space-y-6">
          {phases.map((phase, pIndex) => (
            <div key={pIndex} className="border border-outline-variant rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-error-container text-error flex items-center justify-center text-label-sm">
                    {pIndex + 1}
                  </span>
                  <span className="font-label-sm text-on-surface-variant">{t('phase')}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onPhasesChange?.(phases.filter((_, i) => i !== pIndex))}
                  className="text-error hover:opacity-80 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
              <input
                value={phase.name}
                onChange={(e) => {
                  const updated = [...phases];
                  updated[pIndex] = { ...phase, name: e.target.value };
                  onPhasesChange?.(updated);
                }}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary mb-3"
                placeholder={t('phaseNamePlaceholder')}
              />
              <div className="space-y-2 ml-8">
                {phase.steps.map((step, sIndex) => (
                  <div key={sIndex} className="border-l-2 border-outline-variant pl-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-label-sm text-on-surface-variant">
                        {t('step')} {sIndex + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...phases];
                          updated[pIndex] = {
                            ...phase,
                            steps: phase.steps.filter((_, i) => i !== sIndex),
                          };
                          onPhasesChange?.(updated);
                        }}
                        className="text-error hover:opacity-80 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                    <input
                      value={step.title}
                      onChange={(e) => {
                        const updated = [...phases];
                        const stepsUpdated = [...phase.steps];
                        stepsUpdated[sIndex] = { ...step, title: e.target.value };
                        updated[pIndex] = { ...phase, steps: stepsUpdated };
                        onPhasesChange?.(updated);
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary mb-1"
                      placeholder={t('stepTitlePlaceholder')}
                    />
                    <textarea
                      value={step.body}
                      onChange={(e) => {
                        const updated = [...phases];
                        const stepsUpdated = [...phase.steps];
                        stepsUpdated[sIndex] = { ...step, body: e.target.value };
                        updated[pIndex] = { ...phase, steps: stepsUpdated };
                        onPhasesChange?.(updated);
                      }}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                      rows={3}
                      placeholder={t('stepBodyPlaceholder')}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...phases];
                    updated[pIndex] = { ...phase, steps: [...phase.steps, { title: '', body: '' }] };
                    onPhasesChange?.(updated);
                  }}
                  className="text-primary font-label-sm hover:underline flex items-center gap-1 ml-4"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  {t('addStep')}
                </button>
              </div>
            </div>
          ))}
          {phases.length === 0 && (
            <p className="text-label-sm text-on-surface-variant opacity-50 text-center py-8">
              {t('noPhasesYet')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

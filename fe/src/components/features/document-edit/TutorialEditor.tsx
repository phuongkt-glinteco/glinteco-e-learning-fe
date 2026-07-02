'use client';

import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/default/select';
import { Input } from '@/components/ui/default/input';
import { Textarea } from '@/components/ui/default/textarea';
import { Label } from '@/components/ui/default/label';
import { DocumentReadingEditor } from './DocumentReadingEditor';
import { DocumentProceduralEditor } from './DocumentProceduralEditor';
import { ResourceSelector } from './ResourceSelector';
import { LineByLineInput } from './LineByLineInput';
import type { ResourceRef } from '@/components/features/document-detail/types';

export interface TutorialEditorData {
  learningObjectives?: string[];
  prerequisites?: ResourceRef[];
  duration?: number | string;
  difficulty?: string;
  explanation?: string;
  stepsStr?: string;
  exercises?: string[];
  summary?: string;
  legacySteps?: Array<{ title: string; body: string }>;
}

interface TutorialEditorProps {
  data: TutorialEditorData;
  onChange: (data: TutorialEditorData) => void;
}

export function TutorialEditor({ data, onChange }: TutorialEditorProps) {
  const t = useTranslations('DocumentEdit');

  return (
    <div className="space-y-xl">
      {/* Learning Overview & Metadata */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-lg shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm">
          {t('overview')}
        </h3>

        <LineByLineInput
          label={t('learningObjectives')}
          value={data.learningObjectives || []}
          onChange={(items) => onChange({ ...data, learningObjectives: items })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('duration')}
            </Label>
            <Input
              type="number"
              min="1"
              value={data.duration ?? ''}
              onChange={(e) => onChange({ ...data, duration: e.target.value ? Number(e.target.value) : undefined })}
              placeholder={t('durationPlaceholder')}
              className="w-full bg-surface-container-lowest"
            />
          </div>

          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('difficulty')}
            </Label>
            <Select
              value={data.difficulty || 'Beginner'}
              onValueChange={(val) => onChange({ ...data, difficulty: val })}
            >
              <SelectTrigger className="w-full h-11 bg-surface-container-lowest border-outline-variant">
                <SelectValue placeholder={t('selectDifficulty')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">{t('beginner')}</SelectItem>
                <SelectItem value="Intermediate">{t('intermediate')}</SelectItem>
                <SelectItem value="Advanced">{t('advanced')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ResourceSelector
          label={t('prerequisites')}
          value={data.prerequisites || []}
          onChange={(items) => onChange({ ...data, prerequisites: items })}
        />

        <div className="space-y-sm">
          <Label className="text-sm font-semibold text-on-surface">
            {t('explanation')}
          </Label>
          <Textarea
            rows={3}
            value={data.explanation || ''}
            onChange={(e) => onChange({ ...data, explanation: e.target.value })}
            placeholder={t('explanationPlaceholder')}
            className="w-full bg-surface-container-lowest resize-y"
          />
        </div>
      </section>

      {/* Tutorial Steps */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-md shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm">
          {t('steps')}
        </h3>
        
        {data.legacySteps && data.legacySteps.length > 0 ? (
          <DocumentProceduralEditor
            kind="Tutorial"
            explanationOrBackground=""
            onExplanationOrBackgroundChange={() => {}}
            steps={data.legacySteps}
            onStepsChange={(steps) => onChange({ ...data, legacySteps: steps })}
          />
        ) : (
          <DocumentReadingEditor
            body={data.stepsStr || ''}
            onChange={(stepsStr) => onChange({ ...data, stepsStr })}
          />
        )}
      </section>

      {/* Exercises & Summary */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-lg shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm">
          {t('exercises')} & {t('summary')}
        </h3>

        <LineByLineInput
          label={t('exercises')}
          value={data.exercises || []}
          onChange={(items) => onChange({ ...data, exercises: items })}
        />

        <div className="space-y-sm">
          <Label className="text-sm font-semibold text-on-surface">
            {t('summary')}
          </Label>
          <Textarea
            rows={4}
            value={data.summary || ''}
            onChange={(e) => onChange({ ...data, summary: e.target.value })}
            placeholder={t('summaryPlaceholder')}
            className="w-full bg-surface-container-lowest resize-y"
          />
        </div>
      </section>
    </div>
  );
}

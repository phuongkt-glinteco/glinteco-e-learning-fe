'use client';

import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/default/textarea';
import { Label } from '@/components/ui/default/label';
import { DocumentReadingEditor } from './DocumentReadingEditor';
import { ResourceSelector } from './ResourceSelector';
import type { ResourceRef } from '@/components/features/document-detail/types';

export interface GuideEditorData {
  objective?: string;
  prerequisites?: ResourceRef[];
  steps?: string;
  expectedResult?: string;
  relatedDocs?: ResourceRef[];
}

interface GuideEditorProps {
  data: GuideEditorData;
  onChange: (data: GuideEditorData) => void;
}

export function GuideEditor({ data, onChange }: GuideEditorProps) {
  const t = useTranslations('DocumentEdit');

  return (
    <div className="space-y-xl">
      {/* Overview & Prerequisites */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-lg shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm">
          {t('overview')}
        </h3>

        <div className="space-y-sm">
          <Label className="text-sm font-semibold text-on-surface">
            {t('objective')}
          </Label>
          <Textarea
            rows={3}
            value={data.objective || ''}
            onChange={(e) => onChange({ ...data, objective: e.target.value })}
            placeholder={t('objectivePlaceholder')}
            className="w-full bg-surface-container-lowest resize-y"
          />
        </div>

        <ResourceSelector
          label={t('prerequisites')}
          value={data.prerequisites || []}
          onChange={(items) => onChange({ ...data, prerequisites: items })}
        />
      </section>

      {/* Procedure Steps */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-md shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm">
          {t('steps')}
        </h3>
        <DocumentReadingEditor
          body={data.steps || ''}
          onChange={(steps) => onChange({ ...data, steps })}
        />
      </section>

      {/* Expected Result & Related Documents */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-lg shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm">
          {t('expectedResult')} & {t('relatedDocs')}
        </h3>

        <div className="space-y-sm">
          <Label className="text-sm font-semibold text-on-surface">
            {t('expectedResult')}
          </Label>
          <Textarea
            rows={3}
            value={data.expectedResult || ''}
            onChange={(e) => onChange({ ...data, expectedResult: e.target.value })}
            placeholder={t('expectedResultPlaceholder')}
            className="w-full bg-surface-container-lowest resize-y"
          />
        </div>

        <ResourceSelector
          label={t('relatedDocs')}
          value={data.relatedDocs || []}
          onChange={(items) => onChange({ ...data, relatedDocs: items })}
        />
      </section>
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/default/textarea';
import { Label } from '@/components/ui/default/label';
import { DocumentReadingEditor } from './DocumentReadingEditor';
import { ResourceSelector } from './ResourceSelector';
import type { ResourceRef, ResourceRefLike } from '@/components/features/document-detail/types';

export interface RunbookEditorData {
  trigger?: string;
  impact?: string;
  prerequisites?: ResourceRefLike[];
  procedure?: string;
  validation?: string;
  rollback?: string;
  escalation?: string;
  relatedDocs?: ResourceRef[];
}

interface RunbookEditorProps {
  data: RunbookEditorData;
  onChange: (data: RunbookEditorData) => void;
}

export function RunbookEditor({ data, onChange }: RunbookEditorProps) {
  const t = useTranslations('DocumentEdit');

  return (
    <div className="space-y-xl">
      {/* Overview & Conditions */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-lg shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm flex items-center gap-sm">
          <span className="material-symbols-outlined text-error">emergency</span>
          <span>{t('overview')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('trigger')} <span className="text-error">*</span>
            </Label>
            <Textarea
              rows={3}
              value={data.trigger || ''}
              onChange={(e) => onChange({ ...data, trigger: e.target.value })}
              placeholder={t('triggerPlaceholder')}
              className="w-full bg-surface-container-lowest resize-y"
            />
          </div>

          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('impact')}
            </Label>
            <Textarea
              rows={3}
              value={data.impact || ''}
              onChange={(e) => onChange({ ...data, impact: e.target.value })}
              placeholder={t('impactPlaceholder')}
              className="w-full bg-surface-container-lowest resize-y"
            />
          </div>
        </div>

        <ResourceSelector
          label={t('prerequisites')}
          value={(data.prerequisites || []).map(p => typeof p === 'string' ? { id: p, title: p } : p)}
          onChange={(items) => onChange({ ...data, prerequisites: items })}
        />
      </section>

      {/* Operating Procedure */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-lg shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm">
          {t('procedure')} <span className="text-error">*</span>
        </h3>

        <div className="space-y-sm">
          <DocumentReadingEditor
            body={data.procedure || ''}
            onChange={(procedure) => onChange({ ...data, procedure })}
          />
        </div>
      </section>

      {/* Verification & Recovery */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-lg shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm">
          {t('validation')}, {t('rollback')} & {t('escalation')}
        </h3>

        <div className="space-y-sm">
          <Label className="text-sm font-semibold text-on-surface">
            {t('validation')}
          </Label>
          <Textarea
            rows={3}
            value={data.validation || ''}
            onChange={(e) => onChange({ ...data, validation: e.target.value })}
            placeholder={t('validationPlaceholder')}
            className="w-full bg-surface-container-lowest resize-y"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('rollback')}
            </Label>
            <Textarea
              rows={3}
              value={data.rollback || ''}
              onChange={(e) => onChange({ ...data, rollback: e.target.value })}
              placeholder={t('rollbackPlaceholder')}
              className="w-full bg-surface-container-lowest resize-y"
            />
          </div>

          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('escalation')}
            </Label>
            <Textarea
              rows={3}
              value={data.escalation || ''}
              onChange={(e) => onChange({ ...data, escalation: e.target.value })}
              placeholder={t('escalationPlaceholder')}
              className="w-full bg-surface-container-lowest resize-y"
            />
          </div>
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

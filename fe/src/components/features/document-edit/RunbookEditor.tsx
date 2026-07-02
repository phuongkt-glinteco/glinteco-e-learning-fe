'use client';

import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/default/select';
import { Input } from '@/components/ui/default/input';
import { Textarea } from '@/components/ui/default/textarea';
import { Label } from '@/components/ui/default/label';
import { DocumentProceduralEditor } from './DocumentProceduralEditor';
import { DocumentReadingEditor } from './DocumentReadingEditor';
import { ResourceSelector } from './ResourceSelector';
import { LineByLineInput } from './LineByLineInput';
import type { ResourceRef } from '@/components/features/document-detail/types';

export interface RunbookEditorData {
  trigger?: string;
  impact?: string;
  prerequisites?: ResourceRef[];
  procedure?: string;
  validation?: string;
  rollback?: string;
  escalation?: string;
  relatedDocs?: ResourceRef[];
  background?: string;
  severity?: string;
  incidentId?: string;
  estimatedTime?: string;
  symptoms?: string[];
  status?: string;
  phases?: Array<{ name: string; steps: Array<{ title: string; body: string }> }>;
}

interface RunbookEditorProps {
  data: RunbookEditorData;
  onChange: (data: RunbookEditorData) => void;
}

export function RunbookEditor({ data, onChange }: RunbookEditorProps) {
  const t = useTranslations('DocumentEdit');

  return (
    <div className="space-y-xl">
      {/* Incident Alert & Metadata */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-lg shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm flex items-center gap-sm">
          <span className="material-symbols-outlined text-error">emergency</span>
          <span>{t('overview')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-md">
          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('severity')}
            </Label>
            <Select
              value={data.severity || '2'}
              onValueChange={(val) => onChange({ ...data, severity: val })}
            >
              <SelectTrigger className="w-full h-11 bg-surface-container-lowest border-outline-variant">
                <SelectValue placeholder={t('selectSeverity')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">SEV-1 (Critical)</SelectItem>
                <SelectItem value="2">SEV-2 (High)</SelectItem>
                <SelectItem value="3">SEV-3 (Medium)</SelectItem>
                <SelectItem value="4">SEV-4 (Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('incidentId')}
            </Label>
            <Input
              type="text"
              value={data.incidentId || ''}
              onChange={(e) => onChange({ ...data, incidentId: e.target.value })}
              placeholder={t('incidentIdPlaceholder')}
              className="w-full bg-surface-container-lowest font-code"
            />
          </div>

          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('estimatedTime')}
            </Label>
            <Input
              type="text"
              value={data.estimatedTime || ''}
              onChange={(e) => onChange({ ...data, estimatedTime: e.target.value })}
              placeholder={t('estimatedTimePlaceholder')}
              className="w-full bg-surface-container-lowest"
            />
          </div>

          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('status')}
            </Label>
            <Select
              value={data.status || 'active'}
              onValueChange={(val) => onChange({ ...data, status: val })}
            >
              <SelectTrigger className="w-full h-11 bg-surface-container-lowest border-outline-variant">
                <SelectValue placeholder={t('selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="drafting">Drafting</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('trigger')}
            </Label>
            <Textarea
              rows={3}
              value={data.trigger || data.background || ''}
              onChange={(e) => onChange({ ...data, trigger: e.target.value, background: e.target.value })}
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

        <LineByLineInput
          label={t('symptoms')}
          value={data.symptoms || []}
          onChange={(items) => onChange({ ...data, symptoms: items })}
        />

        <ResourceSelector
          label={t('prerequisites')}
          value={data.prerequisites || []}
          onChange={(items) => onChange({ ...data, prerequisites: items })}
        />
      </section>

      {/* Procedure & Resolution Phases */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-lg shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm">
          {t('procedure')} & {t('phases')}
        </h3>

        {data.phases && data.phases.length > 0 ? (
          <DocumentProceduralEditor
            kind="Runbook"
            explanationOrBackground=""
            onExplanationOrBackgroundChange={() => {}}
            phases={data.phases}
            onPhasesChange={(phases) => onChange({ ...data, phases })}
            severity={data.severity}
            onSeverityChange={(val) => onChange({ ...data, severity: val })}
            incidentId={data.incidentId}
            onIncidentIdChange={(val) => onChange({ ...data, incidentId: val })}
            estimatedTime={data.estimatedTime}
            onEstimatedTimeChange={(val) => onChange({ ...data, estimatedTime: val })}
            symptoms={data.symptoms}
            onSymptomsChange={(val) => onChange({ ...data, symptoms: val })}
            status={data.status}
            onStatusChange={(val) => onChange({ ...data, status: val })}
          />
        ) : (
          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('procedure')}
            </Label>
            <DocumentReadingEditor
              body={data.procedure || ''}
              onChange={(procedure) => onChange({ ...data, procedure })}
            />
          </div>
        )}
      </section>

      {/* Validation, Rollback & Escalation */}
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

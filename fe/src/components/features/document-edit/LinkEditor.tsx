'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/default/input';
import { Textarea } from '@/components/ui/default/textarea';
import { Label } from '@/components/ui/default/label';
import { Checkbox } from '@/components/ui/default/checkbox';
import { DocumentReadingEditor } from './DocumentReadingEditor';

export interface LinkEditorData {
  provider?: string;
  type?: string;
  openInNewTab?: boolean;
  description?: string;
  overview?: string;
}

interface LinkEditorProps {
  data: LinkEditorData;
  onChange: (data: LinkEditorData) => void;
}

export function LinkEditor({ data, onChange }: LinkEditorProps) {
  const t = useTranslations('DocumentEdit');

  return (
    <div className="space-y-xl">
      {/* Link Metadata */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-lg shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">link</span>
          <span>{t('properties')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('provider')}
            </Label>
            <Input
              type="text"
              value={data.provider || ''}
              onChange={(e) => onChange({ ...data, provider: e.target.value })}
              placeholder={t('providerPlaceholder')}
              className="w-full bg-surface-container-lowest"
            />
          </div>

          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('linkType')}
            </Label>
            <Input
              type="text"
              value={data.type || ''}
              onChange={(e) => onChange({ ...data, type: e.target.value })}
              placeholder="e.g. Video, Figma Design, External Docs"
              className="w-full bg-surface-container-lowest"
            />
          </div>
        </div>

        <div className="pt-xs">
          <Label className="inline-flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-on-surface">
            <Checkbox
              checked={data.openInNewTab ?? true}
              onCheckedChange={(checked) => onChange({ ...data, openInNewTab: Boolean(checked) })}
            />
            <span>{t('openInNewTab')}</span>
          </Label>
        </div>

        <div className="space-y-sm">
          <Label className="text-sm font-semibold text-on-surface">
            {t('description')}
          </Label>
          <Textarea
            rows={3}
            value={data.description || ''}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            placeholder={t('descriptionPlaceholder')}
            className="w-full bg-surface-container-lowest resize-y"
          />
        </div>
      </section>

      {/* Overview & Content */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-md shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm">
          {t('overview')}
        </h3>
        <DocumentReadingEditor
          body={data.overview || ''}
          onChange={(overview) => onChange({ ...data, overview })}
        />
      </section>
    </div>
  );
}

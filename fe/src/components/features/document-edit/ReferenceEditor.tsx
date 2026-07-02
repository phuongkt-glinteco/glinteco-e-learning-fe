'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/default/button';
import { Input } from '@/components/ui/default/input';
import { Textarea } from '@/components/ui/default/textarea';
import { Label } from '@/components/ui/default/label';
import { Checkbox } from '@/components/ui/default/checkbox';
import { DocumentNavigationEditor } from './DocumentNavigationEditor';
import { DocumentReadingEditor } from './DocumentReadingEditor';

export interface ReferencePropertyItem {
  name: string;
  type?: string;
  required?: boolean;
  description?: string;
  defaultValue?: string;
}

export interface ReferenceEditorData {
  category?: string;
  version?: string;
  properties?: ReferencePropertyItem[];
  examples?: string;
  notes?: string;
  sections?: Array<{ heading: string; body: string }>;
}

interface ReferenceEditorProps {
  data: ReferenceEditorData;
  onChange: (data: ReferenceEditorData) => void;
}

export function ReferenceEditor({ data, onChange }: ReferenceEditorProps) {
  const t = useTranslations('DocumentEdit');
  const properties = data.properties || [];

  const handleAddProperty = () => {
    onChange({
      ...data,
      properties: [...properties, { name: '', type: 'string', required: false, defaultValue: '', description: '' }],
    });
  };

  const handleUpdateProperty = (index: number, updated: ReferencePropertyItem) => {
    const next = [...properties];
    next[index] = updated;
    onChange({ ...data, properties: next });
  };

  const handleRemoveProperty = (index: number) => {
    const next = properties.filter((_, i) => i !== index);
    onChange({ ...data, properties: next });
  };

  return (
    <div className="space-y-xl">
      {/* Classification & Metadata */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-lg shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">data_object</span>
          <span>{t('overview')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('category')}
            </Label>
            <Input
              type="text"
              value={data.category || ''}
              onChange={(e) => onChange({ ...data, category: e.target.value })}
              placeholder={t('categoryPlaceholder')}
              className="w-full bg-surface-container-lowest"
            />
          </div>

          <div className="space-y-sm">
            <Label className="text-sm font-semibold text-on-surface">
              {t('version')}
            </Label>
            <Input
              type="text"
              value={data.version || ''}
              onChange={(e) => onChange({ ...data, version: e.target.value })}
              placeholder={t('versionPlaceholder')}
              className="w-full bg-surface-container-lowest font-code"
            />
          </div>
        </div>
      </section>

      {/* Properties & Parameters Table */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-lg shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant/60 pb-sm">
          <h3 className="font-title-md text-title-md text-on-surface">
            {t('properties')}
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddProperty}
            className="flex items-center gap-xs text-primary border-primary/30 hover:bg-primary/5"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>{t('addProperty')}</span>
          </Button>
        </div>

        {properties.length > 0 ? (
          <div className="space-y-md">
            {properties.map((prop, index) => (
              <div
                key={index}
                className="p-md rounded-xl border border-outline-variant bg-surface-container-low space-y-md relative group transition-colors hover:border-primary/40"
              >
                <button
                  type="button"
                  onClick={() => handleRemoveProperty(index)}
                  className="absolute top-3 right-3 text-on-surface-variant hover:text-error p-1.5 rounded-md hover:bg-error-container/20 transition-colors"
                  title={t('remove')}
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm pr-8">
                  <div className="space-y-xs">
                    <Label className="text-xs font-semibold text-on-surface-variant">
                      {t('propertyName')}
                    </Label>
                    <Input
                      type="text"
                      value={prop.name}
                      onChange={(e) => handleUpdateProperty(index, { ...prop, name: e.target.value })}
                      placeholder="e.g. timeoutMs"
                      className="w-full bg-surface-container-lowest font-code"
                    />
                  </div>

                  <div className="space-y-xs">
                    <Label className="text-xs font-semibold text-on-surface-variant">
                      {t('propertyType')}
                    </Label>
                    <Input
                      type="text"
                      value={prop.type || ''}
                      onChange={(e) => handleUpdateProperty(index, { ...prop, type: e.target.value })}
                      placeholder="e.g. number | string"
                      className="w-full bg-surface-container-lowest font-code"
                    />
                  </div>

                  <div className="space-y-xs">
                    <Label className="text-xs font-semibold text-on-surface-variant">
                      {t('defaultValue')}
                    </Label>
                    <Input
                      type="text"
                      value={prop.defaultValue || ''}
                      onChange={(e) => handleUpdateProperty(index, { ...prop, defaultValue: e.target.value })}
                      placeholder="e.g. 5000"
                      className="w-full bg-surface-container-lowest font-code"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-sm">
                  <Label className="flex items-center gap-2 text-xs font-medium text-on-surface cursor-pointer select-none">
                    <Checkbox
                      checked={prop.required || false}
                      onCheckedChange={(checked) => handleUpdateProperty(index, { ...prop, required: Boolean(checked) })}
                    />
                    <span className="text-error font-semibold">{t('required')}</span>
                  </Label>
                </div>

                <div className="space-y-xs">
                  <Label className="text-xs font-semibold text-on-surface-variant">
                    {t('propertyDescription')}
                  </Label>
                  <Input
                    type="text"
                    value={prop.description || ''}
                    onChange={(e) => handleUpdateProperty(index, { ...prop, description: e.target.value })}
                    placeholder="Explanation of what this property does..."
                    className="w-full bg-surface-container-lowest"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-on-surface-variant italic">
            {t('emptyList')}
          </p>
        )}

        {/* Legacy Sections fallback if present */}
        {data.sections && data.sections.length > 0 && (
          <div className="pt-md border-t border-outline-variant space-y-sm">
            <h4 className="text-sm font-semibold text-on-surface">{t('sections')} (Legacy)</h4>
            <DocumentNavigationEditor
              description=""
              onDescriptionChange={() => {}}
              overview={data.sections.map((s) => `## ${s.heading}\n\n${s.body}`).join('\n\n')}
              onOverviewChange={(val) => {
                const sections: Array<{ heading: string; body: string }> = [];
                const headingRegex = /^##\s+(.+)$/gm;
                let lastIndex = 0;
                let match: RegExpExecArray | null;
                while ((match = headingRegex.exec(val)) !== null) {
                  if (lastIndex > 0) {
                    sections[sections.length - 1].body = val.slice(lastIndex, match.index).replace(/^##\s+.*$/, '').trim();
                  }
                  sections.push({ heading: match[1].trim(), body: '' });
                  lastIndex = match.index + match[0].length;
                }
                if (sections.length > 0) {
                  sections[sections.length - 1].body = val.slice(lastIndex).trim();
                }
                onChange({ ...data, sections });
              }}
            />
          </div>
        )}
      </section>

      {/* Examples & Notes */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg space-y-lg shadow-sm">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-sm">
          {t('examples')} & {t('notes')}
        </h3>

        <div className="space-y-sm">
          <Label className="text-sm font-semibold text-on-surface">
            {t('examples')}
          </Label>
          <DocumentReadingEditor
            body={data.examples || ''}
            onChange={(examples) => onChange({ ...data, examples })}
          />
        </div>

        <div className="space-y-sm pt-md">
          <Label className="text-sm font-semibold text-on-surface">
            {t('notes')}
          </Label>
          <Textarea
            rows={4}
            value={data.notes || ''}
            onChange={(e) => onChange({ ...data, notes: e.target.value })}
            placeholder="Any caveats, edge cases or warnings..."
            className="w-full bg-surface-container-lowest resize-y"
          />
        </div>
      </section>
    </div>
  );
}

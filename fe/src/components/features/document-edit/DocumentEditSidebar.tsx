'use client';

import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/default/select';
import { Input } from '@/components/ui/default/input';
import { Label } from '@/components/ui/default/label';
import { TagSelector } from './TagSelector';

interface DocumentEditSidebarProps {
  kind: string;
  kinds: Array<{ value: string; label: string }>;
  onKindChange: (kind: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  tagOptions: Array<{ id: string; name: string }>;
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
}

export function DocumentEditSidebar({
  kind,
  kinds,
  onKindChange,
  title,
  onTitleChange,
  url,
  onUrlChange,
  tagOptions,
  selectedTagIds,
  onTagToggle,
}: DocumentEditSidebarProps) {
  const t = useTranslations('DocumentEdit');

  return (
    <div className="col-span-4 flex flex-col gap-6">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm space-y-6">
        <h3 className="font-title-md text-title-md text-on-surface border-b border-outline-variant/60 pb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">tune</span>
          <span>{t('properties')}</span>
        </h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-on-surface">{t('kind')}</Label>
            <Select value={kind} onValueChange={onKindChange}>
              <SelectTrigger className="w-full h-10 bg-surface-container-lowest border-outline-variant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {kinds.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-on-surface">{t('title')}</Label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full bg-surface-container-lowest"
              type="text"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-on-surface">{t('url')}</Label>
            <Input
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              className="w-full bg-surface-container-lowest font-code text-xs"
              type="text"
              placeholder="https://..."
            />
          </div>

          <div className="pt-2 border-t border-outline-variant/60">
            <TagSelector
              label={t('tags')}
              tagOptions={tagOptions}
              selectedTagIds={selectedTagIds}
              onTagToggle={onTagToggle}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

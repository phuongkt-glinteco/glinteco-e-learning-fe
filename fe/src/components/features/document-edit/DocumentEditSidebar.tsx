'use client';

import { useTranslations } from 'next-intl';

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
      <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
        <h3 className="font-label-md text-on-surface mb-4 border-b border-outline-variant pb-2">
          {t('properties')}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block font-label-sm text-on-surface-variant mb-1.5">{t('kind')}</label>
            <div className="relative">
              <select
                value={kind}
                onChange={(e) => onKindChange(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface appearance-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                {kinds.map((k) => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2 text-on-surface-variant pointer-events-none">expand_more</span>
            </div>
          </div>

          <div>
            <label className="block font-label-sm text-on-surface-variant mb-1.5">{t('title')}</label>
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
              type="text"
            />
          </div>

          <div>
            <label className="block font-label-sm text-on-surface-variant mb-1.5">{t('url')}</label>
            <input
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary"
              type="text"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block font-label-sm text-on-surface-variant mb-1.5">{t('tags')}</label>
            <div className="flex flex-wrap gap-2 p-2 bg-surface-container-low border border-outline-variant rounded-lg min-h-[42px]">
              {tagOptions.length === 0 && (
                <span className="text-label-sm text-on-surface-variant opacity-50 px-1">{t('noTags')}</span>
              )}
              {tagOptions.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => onTagToggle(tag.id)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded font-label-sm transition-colors ${
                      selected
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {tag.name}
                    {selected && (
                      <span className="material-symbols-outlined text-[14px] cursor-pointer">close</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

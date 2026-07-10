'use client';

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { getAllAvailableTags } from '@/mocks/adminTracksMock';

interface TrackTagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TrackTagSelector({ selectedTags, onChange }: TrackTagSelectorProps) {
  const t = useTranslations('EditTrackPage');
  const availableTags = getAllAvailableTags();
  const [customTagInput, setCustomTagInput] = useState('');

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!selectedTags.includes(trimmed)) {
      onChange([...selectedTags, trimmed]);
    }
    setCustomTagInput('');
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-on-surface uppercase tracking-wider">
        {t('tagsLabel')}
      </label>

      {/* Selected tags + available presets */}
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/60'
              }`}
            >
              <span>{tag}</span>
              {isSelected ? (
                <Icon icon="lucide:check" className="w-3.5 h-3.5" />
              ) : (
                <Icon icon="lucide:plus" className="w-3.5 h-3.5 opacity-60" />
              )}
            </button>
          );
        })}
      </div>

      {/* Add custom tag */}
      <div className="flex items-center gap-2 max-w-sm pt-1">
        <input
          type="text"
          value={customTagInput}
          onChange={(e) => setCustomTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddCustomTag();
            }
          }}
          placeholder={t('tagPlaceholder')}
          className="flex-1 h-9 px-3 rounded-xl bg-surface-container/30 border border-outline-variant text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={handleAddCustomTag}
          disabled={!customTagInput.trim()}
          className="h-9 px-3.5 rounded-xl bg-surface-container-high text-on-surface text-xs font-bold hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

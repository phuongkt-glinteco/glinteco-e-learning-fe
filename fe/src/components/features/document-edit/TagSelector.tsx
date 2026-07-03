'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/default/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/default/command';
import { Label } from '@/components/ui/default/label';

interface TagOption {
  id: string;
  name: string;
}

interface TagSelectorProps {
  label?: string;
  tagOptions: TagOption[];
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
  placeholder?: string;
}

export function TagSelector({
  label,
  tagOptions = [],
  selectedTagIds = [],
  onTagToggle,
  placeholder,
}: TagSelectorProps) {
  const t = useTranslations('DocumentEdit');
  const [open, setOpen] = useState(false);

  const selectedTags = tagOptions.filter((tag) => selectedTagIds.includes(tag.id));

  return (
    <div className="space-y-sm">
      {label && (
        <Label className="block text-sm font-semibold text-on-surface">
          {label}
        </Label>
      )}

      {/* Selected Tags Pills */}
      <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-surface-container-lowest border border-outline-variant rounded-xl items-center shadow-2xs">
        {selectedTags.length > 0 ? (
          selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="px-2.5 py-1 gap-1.5 font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all rounded-lg text-xs flex items-center shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">label</span>
              <span>{tag.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagToggle(tag.id);
                }}
                className="text-primary/70 hover:text-error hover:bg-error/10 rounded-full p-0.5 transition-colors flex items-center justify-center"
                title={t('remove')}
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-xs text-on-surface-variant italic px-1">
            {placeholder || t('noTags')}
          </span>
        )}

        {/* Add Tag Popover Button */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs font-medium text-primary border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 rounded-lg flex items-center gap-1 ml-auto"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>{t('addTag') || 'Add Tag'}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0 rounded-xl border-outline-variant shadow-lg" align="end">
            <Command>
              <CommandInput placeholder={t('searchTags') || 'Search tags...'} className="h-9 text-xs" />
              <CommandList className="max-h-[200px] overflow-y-auto">
                <CommandEmpty className="py-4 text-center text-xs text-on-surface-variant">
                  {t('noResults') || 'No tags found.'}
                </CommandEmpty>
                <CommandGroup>
                  {tagOptions.map((tag) => {
                    const isSelected = selectedTagIds.includes(tag.id);
                    return (
                      <CommandItem
                        key={tag.id}
                        value={tag.name}
                        onSelect={() => {
                          onTagToggle(tag.id);
                        }}
                        className="flex items-center justify-between text-xs cursor-pointer py-2 px-3 rounded-lg hover:bg-surface-container-high transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                            label
                          </span>
                          <span className="font-medium text-on-surface">{tag.name}</span>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            check
                          </span>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

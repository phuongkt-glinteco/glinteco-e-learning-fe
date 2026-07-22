'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/default/button';
import { Badge } from '@/components/ui/default/badge';
import { Label } from '@/components/ui/default/label';
import ResourceDocumentPickerDialog from '@/components/features/tracks/exercises/ResourceDocumentPickerDialog';
import type { ResourceRef } from '@/components/features/document-detail/types';
import type { DocumentResponseDto } from '@/services/api-client';

interface ResourceSelectorProps {
  label?: string;
  value?: ResourceRef[];
  onChange?: (items: ResourceRef[]) => void;
  placeholder?: string;
}

export function ResourceSelector({
  label,
  value = [],
  onChange,
  placeholder,
}: ResourceSelectorProps) {
  const t = useTranslations('DocumentEdit');
  const [openDialog, setOpenDialog] = useState(false);

  const handleRemove = (id: string) => {
    const next = value.filter((item) => item.id !== id);
    onChange?.(next);
  };

  const handleConfirm = (ids: string[], documents?: DocumentResponseDto[]) => {
    const nextItems: ResourceRef[] = ids.map((id) => {
      const existing = value.find((item) => item.id === id);
      if (existing) return existing;
      const foundDoc = documents?.find((d) => d.id === id);
      if (foundDoc) {
        return {
          id: foundDoc.id,
          title: foundDoc.title,
          kind: foundDoc.kind,
        };
      }
      return { id, title: id };
    });
    onChange?.(nextItems);
    setOpenDialog(false);
  };

  const selectedIds = value.map((item) => item.id);

  return (
    <div className="space-y-sm">
      {label && (
        <Label className="text-sm font-semibold text-on-surface">
          {label}
        </Label>
      )}
      
      {value.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
          {value.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-sm p-3 bg-surface-container-lowest border border-outline-variant rounded-xl group hover:border-primary/50 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-sm min-w-0 flex-1">
                <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">
                  {item.kind === 'guide' ? 'menu_book' :
                   item.kind === 'tutorial' ? 'school' :
                   item.kind === 'runbook' ? 'emergency' :
                   item.kind === 'reference' ? 'data_object' :
                   item.kind === 'link' ? 'link' : 'article'}
                </span>
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  <p className="text-sm font-medium text-on-surface truncate">
                    {item.title || item.name || item.id}
                  </p>
                  {item.kind && (
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider px-1.5 py-0">
                      {item.kind}
                    </Badge>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="text-on-surface-variant hover:text-error p-1 rounded-md hover:bg-error-container/20 transition-colors flex-shrink-0"
                title={t('remove')}
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-on-surface-variant italic">
          {placeholder || t('emptyList')}
        </p>
      )}

      <div className="pt-xs">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpenDialog(true)}
          className="flex items-center gap-xs text-primary border-primary/30 hover:bg-primary/5"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>{t('selectResource')}</span>
        </Button>
      </div>

      <ResourceDocumentPickerDialog
        open={openDialog}
        selectedIds={selectedIds}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

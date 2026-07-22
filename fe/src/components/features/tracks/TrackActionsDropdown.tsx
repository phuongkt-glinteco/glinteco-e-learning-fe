'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';

interface TrackActionsDropdownProps {
  trackId: string;
  onDelete: () => void;
}

export function TrackActionsDropdown({
  trackId,
  onDelete,
}: TrackActionsDropdownProps) {
  const t = useTranslations('TracksPage');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded-lg hover:bg-surface-container-highest dark:hover:bg-surface-container transition-colors text-on-surface-variant active:scale-90 cursor-pointer"
        aria-expanded={open}
        aria-label="Track actions"
      >
        <Icon icon="lucide:more-vertical" className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-surface-container-lowest dark:bg-surface-container shadow-lg border border-outline-variant py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push(`/admin/tracks/${trackId}`);
            }}
            className="w-full px-3.5 py-2 text-left text-xs text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container-high flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Icon icon="lucide:eye" className="w-4 h-4 text-primary" />
            <span>{t('actions.view')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push(`/admin/tracks/${trackId}/edit`);
            }}
            className="w-full px-3.5 py-2 text-left text-xs text-on-surface hover:bg-surface-container-low dark:hover:bg-surface-container-high flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Icon icon="lucide:edit-3" className="w-4 h-4 text-amber-600" />
            <span>{t('actions.edit')}</span>
          </button>

          <div className="my-1 border-t border-outline-variant/60" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full px-3.5 py-2 text-left text-xs text-error hover:bg-error/10 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Icon icon="lucide:trash-2" className="w-4 h-4" />
            <span>{t('actions.delete')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

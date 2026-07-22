'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';

interface AdminTrackActionsDropdownProps {
  trackId: string;
  onDelete: () => void;
}

export function AdminTrackActionsDropdown({
  trackId,
  onDelete,
}: AdminTrackActionsDropdownProps) {
  const t = useTranslations('AdminTracksPage');
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
        className="p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface active:scale-95 cursor-pointer"
        aria-expanded={open}
        aria-label="Actions"
      >
        <Icon icon="lucide:more-vertical" className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-48 rounded-xl bg-surface shadow-lg border border-outline-variant py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push(`/admin/tracks/${trackId}`);
            }}
            className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-on-surface hover:bg-surface-container/50 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Icon icon="lucide:list-tree" className="w-4 h-4 text-primary" />
            <span>{t('manageLessons')}</span>
          </button>

          

          <div className="my-1 border-t border-outline-variant/60" />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="w-full px-3.5 py-2.5 text-left text-xs font-bold text-error hover:bg-error/10 flex items-center gap-2.5 transition-colors cursor-pointer"
          >
            <Icon icon="lucide:trash-2" className="w-4 h-4" />
            <span>{t('delete')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

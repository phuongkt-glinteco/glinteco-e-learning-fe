'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';
import { TRACK_ICONS } from '../utils/icon-mapping';

interface TrackIconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function TrackIconPicker({ value, onChange }: TrackIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
    openUpward: boolean;
  } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const VIEWPORT_PADDING = 12;
      const MENU_GAP = 4;
      const MENU_MIN_HEIGHT = 96;
      const MENU_MAX_HEIGHT = 320;

      const rect = buttonRef.current.getBoundingClientRect();
      const availableBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING - MENU_GAP;
      const availableAbove = rect.top - VIEWPORT_PADDING - MENU_GAP;
      const openUpward = availableBelow < MENU_MIN_HEIGHT && availableAbove > availableBelow;
      const availableHeight = openUpward ? availableAbove : availableBelow;
      const menuHeight = Math.max(
        MENU_MIN_HEIGHT,
        Math.min(MENU_MAX_HEIGHT, availableHeight),
      );
      const left = Math.min(
        Math.max(VIEWPORT_PADDING, rect.left),
        window.innerWidth - rect.width - VIEWPORT_PADDING,
      );
      const rawTop = openUpward ? rect.top - MENU_GAP - menuHeight : rect.bottom + MENU_GAP;
      const top = Math.max(
        VIEWPORT_PADDING,
        Math.min(rawTop, window.innerHeight - VIEWPORT_PADDING - menuHeight),
      );

      setPosition({
        top,
        left,
        width: rect.width,
        maxHeight: menuHeight,
        openUpward,
      });
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      updatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  const selected = value ? TRACK_ICONS.find((i) => i.value === value) : null;

  return (
    <div className="relative h-full">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant hover:border-primary/50 transition-colors text-left cursor-pointer"
      >
        {selected ? (
          <>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon icon={`lucide:${selected.lucide}`} className="size-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-foreground">{selected.label}</div>
              <div className="text-[11px] text-muted-foreground">{selected.value}</div>
            </div>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Chọn icon</span>
        )}
        <Icon icon="lucide:chevron-down" className="size-4 text-muted-foreground shrink-0" />
      </button>

      {open && position && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: position.top, left: position.left, width: position.width, zIndex: 100 }}
          className={`rounded-xl bg-popover border border-border shadow-lg py-1 animate-in fade-in zoom-in-95 duration-150 ${
            position.openUpward ? 'origin-bottom' : 'origin-top'
          }`}
        >
          <div style={{ maxHeight: position.maxHeight }} className="overflow-y-auto custom-scrollbar">
            {TRACK_ICONS.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary/15' : 'bg-surface-container'
                  }`}>
                    <Icon icon={`lucide:${opt.lucide}`} className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-[11px] text-muted-foreground">{opt.value}</div>
                  </div>
                  {isSelected && (
                    <Icon icon="lucide:check" className="size-4 shrink-0 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

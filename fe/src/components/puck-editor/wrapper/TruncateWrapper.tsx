'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface TruncateWrapperProps {
  children: React.ReactNode;
  maxHeight?: number;
  enabled?: boolean;
}

export function TruncateWrapper({
  children,
  maxHeight = 360,
  enabled = true,
}: TruncateWrapperProps) {
  const t = useTranslations('PuckEditor.Common.LearnerView');
  const [expanded, setExpanded] = useState(false);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full">
      <div
        className="w-full transition-all duration-300 overflow-hidden"
        style={{
          maxHeight: expanded ? 'none' : `${maxHeight}px`,
        }}
      >
        {children}
      </div>

      {!expanded && (
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
      )}

      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-primary hover:underline transition-colors cursor-pointer"
        >
          {expanded ? (
            <>
              <span>{t('collapseContent')}</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>{t('expandContent')}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { Icon } from '@iconify/react';

interface TruncateWrapperProps {
  truncateHeight?: number;
  children: React.ReactNode;
}

export function TruncateWrapper({ truncateHeight, children }: TruncateWrapperProps) {
  const [expanded, setExpanded] = useState(false);

  if (!truncateHeight || truncateHeight <= 0) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full">
      <div
        style={{
          maxHeight: expanded ? 'none' : `${truncateHeight}px`,
        }}
        className="overflow-hidden transition-all duration-300"
      >
        {children}
      </div>

      {!expanded && (
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-surface via-surface/80 to-transparent pointer-events-none" />
      )}

      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface px-4 py-1.5 text-xs font-semibold text-primary shadow-sm hover:bg-surface-variant transition-colors"
        >
          <span>{expanded ? 'Thu gọn nội dung' : 'Xem thêm nội dung'}</span>
          <Icon
            icon={expanded ? 'lucide:chevron-up' : 'lucide:chevron-down'}
            className="h-3.5 w-3.5"
          />
        </button>
      </div>
    </div>
  );
}

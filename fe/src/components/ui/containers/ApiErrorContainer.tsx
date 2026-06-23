'use client';

import { useState } from 'react';
import { useApiError } from '@/providers/ApiErrorProvider';
import { ApiErrorItem } from '../list-items/ApiErrorItem';
import { useTranslations } from 'next-intl';

export function ApiErrorContainer() {
  const t = useTranslations('ApiErrors');
  const { errors, dismissError, clearAllErrors } = useApiError();
  const [isExpanded, setIsExpanded] = useState(false);

  if (errors.length === 0) return null;

  const displayedErrors = isExpanded ? errors : errors.slice(-3);
  const hiddenCount = errors.length - displayedErrors.length;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-auto">
      <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto scrollbar-none pr-1">
        {displayedErrors.map((error) => (
          <ApiErrorItem
            key={error.id}
            title={t(`title${error.errorCode}`)}
            message={t(`content${error.errorCode}`)}
            onClose={() => dismissError(error.id)}
          />
        ))}
      </div>

      {errors.length > 1 && (
        <div className="flex items-center justify-between px-4 py-2 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs backdrop-blur-md shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 select-none">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {errors.length} errors
          </span>
          <div className="flex items-center gap-3">
            {errors.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:text-red-500 dark:hover:text-red-400 font-semibold cursor-pointer transition-colors flex items-center gap-0.5"
              >
                {isExpanded ? (
                  <>
                    Collapse
                    <span className="material-symbols-outlined text-[14px] leading-none">expand_less</span>
                  </>
                ) : (
                  <>
                    Expand (+{hiddenCount})
                    <span className="material-symbols-outlined text-[14px] leading-none">expand_more</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={clearAllErrors}
              className="hover:text-red-500 dark:hover:text-red-400 font-semibold text-zinc-400 dark:text-zinc-500 cursor-pointer transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { triggerApiError } from '@/services/api-client';

export default function TestUIPageDashboard() {
  const errorCodes = [
    { code: 'INTERNAL_SERVER_ERROR', label: '500 Server Error' },
    { code: 'UNAUTHORIZED', label: '401 Unauthorized' },
    { code: 'FORBIDDEN', label: '403 Forbidden' },
    { code: 'NOT_FOUND', label: '404 Not Found' },
    { code: 'VALIDATION_ERROR', label: 'Validation Error' },
    { code: 'NETWORK_ERROR', label: 'Network Error' },
    { code: 'TEST_CUSTOM_CODE', label: 'Test Custom Error Code' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 px-4 text-center">
      <div className="max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-2">
          Dashboard Test Sandbox
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
          Test the new global API Error popup component below. Push multiple errors to observe stacking, expansion (+N), and close actions.
        </p>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider text-left">
            Trigger Backend API Errors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {errorCodes.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => triggerApiError(code)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/20 dark:hover:text-red-400 dark:hover:border-red-900/50 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">error</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-150 dark:border-zinc-800 text-xs text-zinc-400 text-left space-y-2 leading-relaxed">
          <p className="font-semibold text-zinc-500 dark:text-zinc-300">Features implemented:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Fixed in the bottom-right corner.</li>
            <li>Stacks up to 3 errors. Shows an Expand button when more than 3 exist.</li>
            <li>Fully localized using `useTranslations` (handles missing keys fallback dynamically).</li>
            <li>Root layout remains a Server Component; client interactivity is encapsulated.</li>
            <li>Triggerable programmatically from anywhere using the `triggerApiError` helper or standard client interceptors.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
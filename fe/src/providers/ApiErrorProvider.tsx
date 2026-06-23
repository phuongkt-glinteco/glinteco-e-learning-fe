'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { UiShowError } from '@/services/errors';

export interface StackedError {
  id: string;
  errorCode: string;
  message: string;
  timestamp: number;
}

interface ApiErrorContextType {
  errors: StackedError[];
  dismissError: (id: string) => void;
  clearAllErrors: () => void;
}

const Ctx = createContext<ApiErrorContextType | null>(null);

export function ApiErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<StackedError[]>([]);
  const pathname = usePathname();

  const dismiss = useCallback((id: string) => setErrors((p) => p.filter((e) => e.id !== id)), []);
  const clear = useCallback(() => setErrors([]), []);

  useEffect(() => { clear(); }, [pathname, clear]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const items: UiShowError[] = Array.isArray(detail) ? detail : [detail];

      for (const item of items) {
        if (item instanceof UiShowError) {
          const id = Math.random().toString(36).substring(2, 9);
          setErrors((p) => [
            ...p,
            {
              id,
              errorCode: item.errorCode,
              message: item.message,
              timestamp: Date.now(),
            },
          ]);
          setTimeout(() => dismiss(id), 5000);
        }
      }
    };

    window.addEventListener('api-error', handler);
    return () => window.removeEventListener('api-error', handler);
  }, [dismiss]);

  return (
    <Ctx.Provider value={{ errors, dismissError: dismiss, clearAllErrors: clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApiError(): ApiErrorContextType {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApiError must be used within ApiErrorProvider');
  return ctx;
}

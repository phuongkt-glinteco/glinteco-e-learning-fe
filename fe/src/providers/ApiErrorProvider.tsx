'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { UiShowError } from '@/services/errors';
import { clearTokens } from '@/services/api-client';

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
const TOAST_DEDUPE_MS = 2500;

export function ApiErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<StackedError[]>([]);
  const recentErrorsRef = useRef<Map<string, number>>(new Map());
  const pathname = usePathname();
  const router = useRouter();

  const dismiss = useCallback((id: string) => setErrors((p) => p.filter((e) => e.id !== id)), []);
  const clear = useCallback(() => setErrors([]), []);

  useEffect(() => { clear(); }, [pathname, clear]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      const items: UiShowError[] = Array.isArray(detail) ? detail : [detail];
      const now = Date.now();

      for (const item of items) {
        if (item instanceof UiShowError) {
          if (item.errorCode === 'SESSION_EXPIRED') {
            clearTokens();
            router.push('/login?expired=true');
            clear();
            return;
          }

          const dedupeKey = `${item.errorCode}:${item.message}`;
          const lastSeenAt = recentErrorsRef.current.get(dedupeKey);
          if (lastSeenAt && now - lastSeenAt < TOAST_DEDUPE_MS) continue;

          recentErrorsRef.current.set(dedupeKey, now);
          for (const [key, seenAt] of recentErrorsRef.current) {
            if (now - seenAt > TOAST_DEDUPE_MS) recentErrorsRef.current.delete(key);
          }

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
  }, [clear, dismiss, router]);

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

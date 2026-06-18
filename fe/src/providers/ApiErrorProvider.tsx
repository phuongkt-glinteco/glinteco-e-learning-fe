'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export interface StackedError {
  id: string;
  code: string;
  timestamp: number;
}

interface ApiErrorContextType {
  errors: StackedError[];
  addError: (code: string) => void;
  dismissError: (id: string) => void;
  clearAllErrors: () => void;
}

const ApiErrorContext = createContext<ApiErrorContextType | null>(null);

interface ApiErrorProviderProps {
  children: ReactNode;
}

export function ApiErrorProvider({ children }: ApiErrorProviderProps) {
  const [errors, setErrors] = useState<StackedError[]>([]);
  const pathname = usePathname();

  const dismissError = useCallback((id: string) => {
    setErrors((prev) => prev.filter((err) => err.id !== id));
  }, []);

  const addError = useCallback((code: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newError: StackedError = {
      id,
      code,
      timestamp: Date.now(),
    };
    setErrors((prev) => [...prev, newError]);

    // Auto-dismiss the error after 5 seconds
    setTimeout(() => {
      dismissError(id);
    }, 5000);
  }, [dismissError]);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Clear errors on route change to prevent stale errors from other pages persisting
  useEffect(() => {
    clearAllErrors();
  }, [pathname, clearAllErrors]);

  useEffect(() => {
    const handleApiError = (event: Event) => {
      const customEvent = event as CustomEvent;
      const errorCode = customEvent.detail?.code || 'UNKNOWN_ERROR';
      addError(errorCode);
    };

    window.addEventListener('api-error', handleApiError);
    return () => {
      window.removeEventListener('api-error', handleApiError);
    };
  }, [addError]);

  return (
    <ApiErrorContext.Provider value={{ errors, addError, dismissError, clearAllErrors }}>
      {children}
    </ApiErrorContext.Provider>
  );
}

export function useApiError(): ApiErrorContextType {
  const context = useContext(ApiErrorContext);
  if (!context) {
    throw new Error('useApiError must be used within an ApiErrorProvider');
  }
  return context;
}

'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface FeatureFooterContextType {
  footer: ReactNode | null;
  setFooter: (node: ReactNode | null) => void;
}

const FeatureFooterContext = createContext<FeatureFooterContextType>({
  footer: null,
  setFooter: () => {},
});

export function FeatureFooterProvider({ children }: { children: ReactNode }) {
  const [footer, setFooter] = useState<ReactNode | null>(null);

  return (
    <FeatureFooterContext.Provider value={{ footer, setFooter }}>
      {children}
    </FeatureFooterContext.Provider>
  );
}

export function useFeatureFooter() {
  return useContext(FeatureFooterContext);
}

/**
 * Component đăng ký Footer Bar vào FeatureLayout / AppShell
 * Khi mounted sẽ hiển thị ở đáy của SidebarInset (không bị đè lên Sidebar khi thu phóng)
 */
export function FeatureFooterPortal({ children }: { children: ReactNode }) {
  const { setFooter } = useFeatureFooter();

  useEffect(() => {
    setFooter(children);
    return () => {
      setFooter(null);
    };
  }, [children, setFooter]);

  return null;
}

'use client';

import type { ReactNode } from 'react';
import AppShell from './AppShell';

export { FeatureFooterPortal, useFeatureFooter } from './FeatureFooterContext';

interface FeatureLayoutProps {
  children: ReactNode;
}

export default function FeatureLayout({ children }: FeatureLayoutProps) {
  return <AppShell>{children}</AppShell>;
}

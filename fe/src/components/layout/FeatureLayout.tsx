'use client';

import type { ReactNode } from 'react';
import AppShell from './AppShell';

interface FeatureLayoutProps {
  children: ReactNode;
}

export default function FeatureLayout({ children }: FeatureLayoutProps) {
  return <AppShell>{children}</AppShell>;
}



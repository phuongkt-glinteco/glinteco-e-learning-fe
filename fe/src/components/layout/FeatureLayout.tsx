'use client';

import type { ReactNode } from 'react';
import AppShell from './AppShell';
import { useFeatureBarStore } from '@/stores/featureBarStore';

interface FeatureLayoutProps {
  children: ReactNode;
}

export default function FeatureLayout({ children }: FeatureLayoutProps) {
  const { bottomBar, rightSidebar } = useFeatureBarStore();

  return (
    <AppShell>
      <div className="flex-1 flex flex-col w-full h-full relative overflow-hidden">
        {/* Main Content Area + Optional Right Sidebar */}
        <div className="flex-1 flex flex-row overflow-hidden w-full">
          <div className="flex-1 min-w-0 flex flex-col overflow-y-auto">
            {children}
          </div>

          {rightSidebar && (
            <aside className="w-80 lg:w-96 shrink-0 border-l border-outline-variant bg-surface-container-lowest overflow-y-auto flex flex-col">
              {rightSidebar}
            </aside>
          )}
        </div>

        {/* Bottom Bar slot */}
        {bottomBar && (
          <div className="w-full shrink-0 border-t border-outline-variant bg-surface z-30">
            {bottomBar}
          </div>
        )}
      </div>
    </AppShell>
  );
}

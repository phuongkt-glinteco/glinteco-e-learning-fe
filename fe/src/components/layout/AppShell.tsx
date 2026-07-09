'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/default/sidebar';
import { ScrollArea } from '@/components/ui/default/scroll-area';
import { AppSidebar } from './AppSidebar';
import Header from './Header';
import { useAuth } from '@/providers/AuthProvider';
import LoadingPage from '../ui/loading/LoadingPage';
import { FeatureFooterProvider, useFeatureFooter } from './FeatureFooterContext';

interface AppShellProps {
  children: ReactNode;
}

function AppShellInner({ children }: AppShellProps) {
  const { loading } = useAuth();
  const { footer } = useFeatureFooter();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden bg-background flex flex-col h-svh max-h-svh">
        <Header />
        <main className="flex-1 overflow-hidden flex flex-col relative w-full">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingPage />
            </div>
          ) : (
            <ScrollArea 
              className="w-full flex-1 h-full"
              viewportClassName="[&>div]:!block [&>div]:!min-h-full [&>div]:!w-full [&>div]:!flex [&>div]:!flex-col"
            >
              <div className="w-full flex-1 flex flex-col">
                {children}
              </div>
            </ScrollArea>
          )}
        </main>

        {/* Dynamic Registered Footer Slot (Luôn nằm đúng dưới nội dung SidebarInset, không đè Sidebar) */}
        {footer && (
          <div className="w-full shrink-0 z-50 bg-surface border-t border-outline-variant">
            {footer}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <FeatureFooterProvider>
      <AppShellInner>{children}</AppShellInner>
    </FeatureFooterProvider>
  );
}

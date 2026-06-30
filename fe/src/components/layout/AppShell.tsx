'use client';

import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/default/sidebar';
import { AppSidebar } from './AppSidebar';
import Header from './Header';
import { useAuth } from '@/providers/AuthProvider';
import LoadingPage from '../ui/loading/LoadingPage';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { loading } = useAuth();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto flex flex-col relative">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <LoadingPage />
            </div>
          ) : (
            <div className="w-full flex-1">
              {children}
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


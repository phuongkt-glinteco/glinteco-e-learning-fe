'use client';

import { useState, useEffect, type ReactNode } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || loading) {
    return <div className="flex items-center justify-center h-screen">
        <LoadingPage />
      </div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden bg-background">
        <Header />
        <main className="flex-1 overflow-y-auto flex flex-col">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

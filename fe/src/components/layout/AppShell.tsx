'use client';

import { useState, useEffect, type ReactNode, Suspense } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileHeader from './MobileHeader';
import MobileSideBar from './MobileSideBar';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import LoadingPage from '../ui/loading/LoadingPage';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  

  const isMobile = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showMobile = isMounted && isMobile;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {showMobile ? (
        <MobileSideBar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
      ) : (
        <Sidebar />
      )}

      <div className="flex-1 flex flex-col md:ml-[256px] h-full overflow-hidden">
        {showMobile ? (
          <MobileHeader onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
        ) : (
          <Header />
        )}
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<LoadingPage />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

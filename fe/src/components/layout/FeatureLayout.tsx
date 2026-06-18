import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface FeatureLayoutProps {
  children: ReactNode;
}

export default function FeatureLayout({ children }: FeatureLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-[256px] h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-lg">
          {children}
        </main>
      </div>
    </div>
  );
}

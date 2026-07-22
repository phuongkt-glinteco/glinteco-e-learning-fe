import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  scrollable?: boolean;
}

export function PageContainer({ children, className, scrollable = false, ...props }: PageContainerProps) {
  return (
    <div className="h-full w-full flex-1 flex flex-col">
      <div className={cn("mx-auto w-full max-w-7xl px-4 md:px-8 py-6 flex-1 flex flex-col", className)} {...props}>
        {children}
      </div>
    </div>
  );
}

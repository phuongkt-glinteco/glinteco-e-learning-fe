import * as React from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/default/scroll-area';

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  scrollable?: boolean;
}

export function PageContainer({ children, className, scrollable = false, ...props }: PageContainerProps) {
  const content = (
    <div className={cn("mx-auto w-full max-w-7xl px-4 md:px-8 py-6", className)} {...props}>
      {children}
    </div>
  );

  if (scrollable) {
    return <ScrollArea className="h-[calc(100vh-4rem)] w-full">{content}</ScrollArea>; // Adjust height as necessary
  }

  return <div className="h-full w-full">{content}</div>;
}

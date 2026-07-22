'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/default/button';

interface RouteErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
}

export function RouteErrorState({
  error,
  reset,
  title = 'Something went wrong',
  description = 'The page could not be rendered. Try again or return to a stable route.',
}: RouteErrorStateProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] w-full items-center justify-center px-4 py-12">
      <section className="w-full max-w-xl rounded-xl border bg-card p-6 text-center shadow-sm md:p-8">
        <span className="material-symbols-outlined mb-4 text-[48px] text-destructive">
          error
        </span>
        <h1 className="text-2xl font-semibold text-foreground break-words">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground break-words">
          {description}
        </p>
        {error.digest ? (
          <p className="mt-4 rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground break-all">
            Error digest: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Retry</Button>
        </div>
      </section>
    </main>
  );
}

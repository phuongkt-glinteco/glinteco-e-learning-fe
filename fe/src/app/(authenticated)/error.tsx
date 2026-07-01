'use client';

import { RouteErrorState } from '@/components/ui/fallback/RouteErrorState';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      error={error}
      reset={reset}
      title="Workspace error"
      description="This workspace section could not be rendered. Retry without leaving the app shell."
    />
  );
}

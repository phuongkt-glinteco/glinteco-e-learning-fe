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
      title="Authentication page error"
      description="The authentication screen could not be rendered. Retry the page before signing in again."
    />
  );
}

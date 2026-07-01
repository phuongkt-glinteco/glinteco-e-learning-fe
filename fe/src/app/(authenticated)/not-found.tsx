import { NotFoundState } from '@/components/ui/fallback/NotFoundState';

export default function NotFound() {
  return (
    <NotFoundState
      title="Workspace page not found"
      description="This authenticated route does not exist or is no longer available."
      href="/dashboard/learner"
      actionLabel="Back to dashboard"
    />
  );
}

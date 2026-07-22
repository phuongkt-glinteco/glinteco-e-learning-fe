import { NotFoundState } from '@/components/ui/fallback/NotFoundState';

export default function NotFound() {
  return (
    <NotFoundState
      title="Page not found"
      description="The route you opened does not exist in RAMP UP."
      actionLabel="Go to home"
    />
  );
}

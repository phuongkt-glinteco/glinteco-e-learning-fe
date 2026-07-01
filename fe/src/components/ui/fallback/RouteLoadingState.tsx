import Skeleton from '@/components/ui/loading/Skeleton';

type RouteLoadingVariant = 'page' | 'dashboard' | 'cards' | 'table' | 'auth';

interface RouteLoadingStateProps {
  variant?: RouteLoadingVariant;
}

function HeaderSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton height={28} width="min(360px, 70%)" rounded="rounded-md" />
      <Skeleton height={18} width="min(560px, 90%)" rounded="rounded-md" />
    </div>
  );
}

function CardSkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-card p-5">
          <Skeleton height={18} width="45%" rounded="rounded-md" />
          <Skeleton height={24} className="mt-5" rounded="rounded-md" />
          <Skeleton height={14} width="82%" className="mt-4" rounded="rounded-md" />
          <Skeleton height={14} width="64%" className="mt-2" rounded="rounded-md" />
          <div className="mt-6 flex gap-2">
            <Skeleton height={28} width={92} rounded="rounded-full" />
            <Skeleton height={28} width={72} rounded="rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="grid grid-cols-4 gap-4 border-b bg-muted/50 p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} height={14} rounded="rounded-md" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 border-b p-4 last:border-b-0">
          <Skeleton height={16} rounded="rounded-md" />
          <Skeleton height={16} rounded="rounded-md" />
          <Skeleton height={16} rounded="rounded-md" />
          <Skeleton height={16} width="70%" rounded="rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function RouteLoadingState({ variant = 'page' }: RouteLoadingStateProps) {
  if (variant === 'auth') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
          <Skeleton height={36} width={120} rounded="rounded-md" />
          <Skeleton height={22} width="70%" className="mt-8" rounded="rounded-md" />
          <Skeleton height={44} className="mt-6" rounded="rounded-lg" />
          <Skeleton height={44} className="mt-3" rounded="rounded-lg" />
          <Skeleton height={40} className="mt-6" rounded="rounded-lg" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 md:px-8">
      <HeaderSkeleton />
      {variant === 'dashboard' ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border bg-card p-5">
                <Skeleton height={18} width="50%" rounded="rounded-md" />
                <Skeleton height={34} width="36%" className="mt-5" rounded="rounded-md" />
              </div>
            ))}
          </div>
          <CardSkeletons count={3} />
        </>
      ) : variant === 'table' ? (
        <>
          <div className="rounded-xl border bg-card p-5">
            <Skeleton height={40} rounded="rounded-lg" />
            <div className="mt-4 flex flex-wrap gap-3">
              <Skeleton height={36} width={150} rounded="rounded-full" />
              <Skeleton height={36} width={150} rounded="rounded-full" />
              <Skeleton height={36} width={150} rounded="rounded-full" />
            </div>
          </div>
          <TableSkeleton />
        </>
      ) : (
        <CardSkeletons count={variant === 'cards' ? 6 : 4} />
      )}
    </main>
  );
}

import { PageContainer } from '@/components/ui';

export default function DocumentDetailLoading() {
  return (
    <PageContainer scrollable>
      {/* Header Skeleton */}
      <div className="mb-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-4 w-24 bg-surface-container-highest rounded-md"></div>
          <span className="text-on-surface-variant text-sm">/</span>
          <div className="h-4 w-48 bg-surface-container-highest rounded-md"></div>
        </div>
        <div className="h-10 w-3/4 max-w-2xl bg-surface-container-highest rounded-lg"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-gutter">
        {/* Main Content Skeleton */}
        <div className="space-y-6">
          <div className="h-64 w-full bg-surface-container-highest rounded-xl animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-4 w-full bg-surface-container-highest rounded-md animate-pulse"></div>
            <div className="h-4 w-[90%] bg-surface-container-highest rounded-md animate-pulse"></div>
            <div className="h-4 w-[95%] bg-surface-container-highest rounded-md animate-pulse"></div>
            <div className="h-4 w-[80%] bg-surface-container-highest rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="h-32 w-full bg-surface-container-highest rounded-xl animate-pulse"></div>
          <div className="h-48 w-full bg-surface-container-highest rounded-xl animate-pulse"></div>
        </div>
      </div>
    </PageContainer>
  );
}

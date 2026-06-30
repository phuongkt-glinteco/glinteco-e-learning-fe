import { PageContainer } from '@/components/ui';

export default function DocumentEditLoading() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 bg-surface-container-highest rounded-full"></div>
          <div className="h-8 w-64 bg-surface-container-highest rounded-md"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 bg-surface-container-highest rounded-lg"></div>
          <div className="h-10 w-32 bg-primary/20 rounded-lg"></div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter flex-1 animate-pulse">
        {/* Sidebar */}
        <div className="col-span-4 space-y-6">
          <div className="h-[400px] w-full bg-surface-container-highest rounded-xl"></div>
        </div>

        {/* Editor */}
        <div className="col-span-8 flex flex-col space-y-6">
          <div className="h-12 w-full bg-surface-container-highest rounded-xl"></div>
          <div className="h-[500px] w-full bg-surface-container-highest rounded-xl"></div>
        </div>
      </div>
    </PageContainer>
  );
}

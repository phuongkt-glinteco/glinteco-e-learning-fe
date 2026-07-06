import { CohortDetailClient } from '@/components/features/cohorts';

export default async function CohortDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="p-gutter max-w-7xl mx-auto space-y-xl w-full flex-1">
      <CohortDetailClient cohortId={id} />
    </div>
  );
}

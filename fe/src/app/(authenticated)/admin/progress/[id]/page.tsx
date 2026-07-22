import { getTranslations } from 'next-intl/server';
import { UserProgressDetailPageClient } from '@/components/features/cohorts/UserProgressDetailPageClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('AppShell');
  const { id } = await params;
  return {
    title: `Chi tiết tiến độ ${id} | Admin`,
    description: t('learnerProgressDesc'),
  };
}

export default async function LearnerProgressDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-gutter max-w-7xl mx-auto space-y-xl w-full flex-1">
      <UserProgressDetailPageClient userId={id} />
    </div>
  );
}

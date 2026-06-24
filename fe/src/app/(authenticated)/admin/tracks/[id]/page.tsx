import AdminTrackDetail from '@/components/features/tracks/detail/AdminTrackDetail';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  return <AdminTrackDetail trackId={id} isFromCreate={sp.from === 'create'} />;
}

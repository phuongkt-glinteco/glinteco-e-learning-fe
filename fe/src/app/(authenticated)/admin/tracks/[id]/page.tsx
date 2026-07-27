import AdminTrackDetail from '@/components/features/tracks/detail/AdminTrackDetail';

export default async function AdminTrackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminTrackDetail trackId={id} />;
}

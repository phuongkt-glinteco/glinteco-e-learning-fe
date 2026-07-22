import { AdminTrackManagementClient } from '@/components/features/tracks/admin/AdminTrackManagementClient';

export default async function AdminTrackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminTrackManagementClient trackId={id} />;
}

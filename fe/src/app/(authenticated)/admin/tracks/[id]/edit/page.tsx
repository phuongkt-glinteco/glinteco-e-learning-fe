import { AdminEditTrackClient } from '@/components/features/tracks/edit/AdminEditTrackClient';

export default async function EditTrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminEditTrackClient trackId={id} />;
}

import TrackEditorPage from '@/components/features/tracks/admin/TrackEditorPage';

export default async function EditTrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TrackEditorPage trackId={id} />;
}

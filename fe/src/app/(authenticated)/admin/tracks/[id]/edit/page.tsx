import TrackEditPage from '@/components/features/tracks/edit/TrackEditPage';

export default async function EditTrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TrackEditPage trackId={id} />;
}

import CreateExercisePage from '@/components/features/tracks/exercises/CreateExercisePage';

export default async function EditTrackExercisePage({
  params,
}: {
  params: Promise<{ id: string; exerciseId: string }>;
}) {
  const { id, exerciseId } = await params;
  return <CreateExercisePage trackId={id} exerciseId={exerciseId} />;
}

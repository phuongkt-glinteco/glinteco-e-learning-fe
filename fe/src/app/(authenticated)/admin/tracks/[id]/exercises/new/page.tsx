import CreateExercisePage from '@/components/features/tracks/exercises/CreateExercisePage';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CreateExercisePage trackId={id} />;
}

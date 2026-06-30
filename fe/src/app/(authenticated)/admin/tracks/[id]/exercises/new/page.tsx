import CreateExercisePage from '@/components/features/tracks/exercises/CreateExercisePage';

export default async function NewTrackExercisePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lessonId?: string }>;
}) {
  const { id } = await params;
  const { lessonId } = await searchParams;
  return <CreateExercisePage trackId={id} lessonId={lessonId} />;
}

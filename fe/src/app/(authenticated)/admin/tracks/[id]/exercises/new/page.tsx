import CreateExercisePage from '@/components/features/tracks/exercises/CreateExercisePage';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lessonId?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  return <CreateExercisePage trackId={id} lessonId={sp.lessonId} />;
}

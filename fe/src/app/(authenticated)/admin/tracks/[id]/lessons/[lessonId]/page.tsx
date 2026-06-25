import LessonDetailPage from '@/components/features/tracks/components/LessonDetailPage';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  return <LessonDetailPage trackId={id} lessonId={lessonId} />;
}

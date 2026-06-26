import { LessonEditorPage } from '@/components/features/tracks/components/LessonEditorPage';

export default async function EditTrackLessonPage({
  params,
}: {
  params: Promise<{ id: string; lessonId: string }>;
}) {
  const { id, lessonId } = await params;
  return <LessonEditorPage trackId={id} lessonId={lessonId} />;
}

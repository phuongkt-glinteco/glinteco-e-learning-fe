import { LessonEditorPage } from '@/components/features/tracks/components/LessonEditorPage';

export default async function NewTrackLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LessonEditorPage trackId={id} />;
}

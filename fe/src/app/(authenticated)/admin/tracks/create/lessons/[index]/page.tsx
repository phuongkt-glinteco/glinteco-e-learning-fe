import { notFound } from 'next/navigation';
import { LessonEditorPage } from '@/components/features/tracks/components/LessonEditorPage';

export default async function Page({
  params,
}: {
  params: Promise<{ index: string }>;
}) {
  const { index } = await params;
  const editIndex = parseInt(index, 10);
  if (isNaN(editIndex) || editIndex < 0) notFound();
  return <LessonEditorPage editIndex={editIndex} />;
}

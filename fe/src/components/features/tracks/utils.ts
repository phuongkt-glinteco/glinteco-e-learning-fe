import type { ExerciseSummaryDto } from '@/services/api-client';

/**
 * Kiểm tra xem một bài tập có phải là bài tập trực tiếp của Track (không thuộc về Lesson nào) hay không.
 */
export function isTrackDirectExercise(ex: ExerciseSummaryDto | null | undefined): boolean {
  if (!ex) return false;
  if (!ex.lessonId) return true;
  if (typeof ex.lessonId === 'object' && Object.keys(ex.lessonId).length === 0) return true;
  return false;
}

import type { LearnerTrack } from '@/components/features/tracks/learner/types';

export type MyCourseTab = 'in_progress' | 'completed';

export function filterMyCourses(
  tracks: LearnerTrack[],
  tab: MyCourseTab
): LearnerTrack[] {
  return tracks
    .filter((track) => track.status !== 'locked')
    .filter((track) => track.status === tab)
    .sort((a, b) => a.order - b.order);
}

export function hasAnyActiveCourse(tracks: LearnerTrack[]): boolean {
  return tracks.some((track) => track.status !== 'locked');
}

export function getProgressPercent(track: LearnerTrack): number {
  if (track.lessonCount <= 0) return 0;
  return Math.round((track.lessonsCompleted / track.lessonCount) * 100);
}

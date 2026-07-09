import type { LearnerTrack } from '@/components/features/tracks/learner/types';

export type MyCourseTab = 'in_progress' | 'completed';

export function filterMyCourses(
  tracks: LearnerTrack[],
  tab: MyCourseTab
): LearnerTrack[] {
  return tracks
    .filter((track) => tab === 'completed'
      ? track.status === 'completed'
      : track.status !== 'completed')
    .sort((a, b) => a.order - b.order);
}

export function hasAnyCourse(tracks: LearnerTrack[]): boolean {
  return tracks.length > 0;
}

export function getProgressPercent(track: LearnerTrack): number {
  if (track.status === 'completed') return 100;
  if (track.lessonCount <= 0) return 0;
  return Math.round((track.lessonsCompleted / track.lessonCount) * 100);
}

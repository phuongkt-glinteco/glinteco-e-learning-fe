import type { LearnerTrack } from '@/components/features/tracks/learner/types';

export type CourseStatusFilter = 'all' | 'in_progress' | 'completed' | 'locked';
export type CourseSortKey = 'order' | 'title' | 'progress';

export interface CourseFilterState {
  status: CourseStatusFilter;
  search: string;
  sort: CourseSortKey;
  page: number;
}

export const PAGE_SIZE = 12;

export const DEFAULT_FILTER: CourseFilterState = {
  status: 'all',
  search: '',
  sort: 'order',
  page: 1,
};

export function filterCourses(
  tracks: LearnerTrack[],
  filter: CourseFilterState
): LearnerTrack[] {
  const keyword = filter.search.trim().toLowerCase();
  const list = tracks.filter((track) => {
    if (filter.status !== 'all' && track.status !== filter.status) return false;
    if (!keyword) return true;
    return (
      track.title.toLowerCase().includes(keyword) ||
      track.description.toLowerCase().includes(keyword)
    );
  });

  const sorted = [...list];
  switch (filter.sort) {
    case 'title':
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'progress':
      sorted.sort((a, b) => {
        const pa = a.lessonCount > 0 ? a.lessonsCompleted / a.lessonCount : 0;
        const pb = b.lessonCount > 0 ? b.lessonsCompleted / b.lessonCount : 0;
        return pb - pa;
      });
      break;
    case 'order':
    default:
      sorted.sort((a, b) => a.order - b.order);
      break;
  }
  return sorted;
}

export function paginate<T>(items: T[], page: number, size: number): T[] {
  const start = (page - 1) * size;
  return items.slice(start, start + size);
}

export function getProgressPercent(track: LearnerTrack): number {
  if (track.lessonCount <= 0) return 0;
  return Math.round((track.lessonsCompleted / track.lessonCount) * 100);
}

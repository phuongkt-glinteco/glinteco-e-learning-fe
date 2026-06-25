import type { TrackDetail, TrackSummary } from '@/services/api-client';

export interface AdminTrackItem {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  order: number;
  lessonCount: number;
  icon: string;
}

export interface AdminTracksPagination {
  total: number;
  page: number;
  limit: number;
  lastPage: number;
}

function getLessonCount(track: TrackSummary | TrackDetail): number {
  if ('lessonCount' in track && typeof track.lessonCount === 'number') {
    return track.lessonCount;
  }
  if ('lessons' in track && Array.isArray(track.lessons)) {
    return track.lessons.length;
  }
  return 0;
}

export function normalizeAdminTrack(track: TrackSummary | TrackDetail): AdminTrackItem | null {
  if (!track.id) return null;
  return {
    id: track.id,
    title: track.title?.trim() || 'Untitled track',
    description: track.description?.trim() || '',
    estimatedTime: track.estimatedTime?.trim() || 'TBD',
    order: track.order ?? 0,
    lessonCount: getLessonCount(track),
    icon: track.icon?.trim() || 'route',
  };
}

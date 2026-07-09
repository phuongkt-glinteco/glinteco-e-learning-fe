export type TrackPublishStatus = 'draft' | 'published' | 'archived';

export interface AdminTrackExtendedMetadata {
  trackId: string;
  status: TrackPublishStatus;
  tags: string[];
  enrolledLearnersCount: number;
}

const AVAILABLE_TAGS = [
  'Backend',
  'Frontend',
  'DevOps',
  'Fullstack',
  'Mandatory',
  'Onboarding',
  'Advanced',
];

// In-memory mock store for track extended metadata
const extendedMetadataStore: Record<string, AdminTrackExtendedMetadata> = {
  'track-1': {
    trackId: 'track-1',
    status: 'published',
    tags: ['Onboarding', 'Mandatory'],
    enrolledLearnersCount: 24,
  },
  'track-2': {
    trackId: 'track-2',
    status: 'published',
    tags: ['Backend', 'Advanced'],
    enrolledLearnersCount: 18,
  },
};

export function getAllAvailableTags(): string[] {
  return AVAILABLE_TAGS;
}

export function getAdminTrackExtendedMetadata(trackId: string): AdminTrackExtendedMetadata {
  if (!extendedMetadataStore[trackId]) {
    // Generate deterministic default metadata based on trackId length/hash
    const hash = trackId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const statuses: TrackPublishStatus[] = ['published', 'draft', 'archived'];
    const tag1 = AVAILABLE_TAGS[hash % AVAILABLE_TAGS.length];
    const tag2 = AVAILABLE_TAGS[(hash + 2) % AVAILABLE_TAGS.length];
    
    extendedMetadataStore[trackId] = {
      trackId,
      status: statuses[hash % 2], // favor published/draft
      tags: [tag1, tag2],
      enrolledLearnersCount: 10 + (hash % 25),
    };
  }
  return extendedMetadataStore[trackId];
}

export function updateAdminTrackExtendedMetadata(
  trackId: string,
  updates: Partial<Pick<AdminTrackExtendedMetadata, 'status' | 'tags'>>
): AdminTrackExtendedMetadata {
  const current = getAdminTrackExtendedMetadata(trackId);
  extendedMetadataStore[trackId] = {
    ...current,
    ...updates,
  };
  return extendedMetadataStore[trackId];
}

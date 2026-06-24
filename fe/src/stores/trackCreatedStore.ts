import { create } from 'zustand';
import type { TrackDetailDto } from '@/services/api-client';

interface TrackCreatedState {
  trackData: TrackDetailDto | null;
  setTrackData: (data: TrackDetailDto) => void;
  clearTrackData: () => void;
}

export const useTrackCreatedStore = create<TrackCreatedState>((set) => ({
  trackData: null,
  setTrackData: (data) => set({ trackData: data }),
  clearTrackData: () => set({ trackData: null }),
}));

import { create } from 'zustand';
import type { ReactNode } from 'react';

interface FeatureBarState {
  bottomBar: ReactNode | null;
  rightSidebar: ReactNode | null;
  setBottomBar: (bottomBar: ReactNode | null) => void;
  setRightSidebar: (rightSidebar: ReactNode | null) => void;
  clearBars: () => void;
}

export const useFeatureBarStore = create<FeatureBarState>((set) => ({
  bottomBar: null,
  rightSidebar: null,
  setBottomBar: (bottomBar) => set({ bottomBar }),
  setRightSidebar: (rightSidebar) => set({ rightSidebar }),
  clearBars: () => set({ bottomBar: null, rightSidebar: null }),
}));

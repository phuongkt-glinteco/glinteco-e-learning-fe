import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProfileVisibility = 'Public to Cohort' | 'Private' | 'Management Only';
export type AnimationSpeed = 'reduced' | 'normal' | 'fast';

export interface SettingsState {
  timezone: string;
  newCourseAssignments: boolean;
  deadlineReminders: boolean;
  weeklyReports: boolean;
  profileVisibility: ProfileVisibility;
  activityStatus: boolean;
  compactMode: boolean;
  animationSpeed: AnimationSpeed;
  
  setTimezone: (tz: string) => void;
  toggleNotification: (key: 'newCourseAssignments' | 'deadlineReminders' | 'weeklyReports') => void;
  setProfileVisibility: (val: ProfileVisibility) => void;
  toggleActivityStatus: () => void;
  setCompactMode: (val: boolean) => void;
  setAnimationSpeed: (val: AnimationSpeed) => void;
  resetToDefault: () => void;
}

const DEFAULT_SETTINGS = {
  timezone: 'Asia/Ho_Chi_Minh',
  newCourseAssignments: true,
  deadlineReminders: true,
  weeklyReports: false,
  profileVisibility: 'Public to Cohort' as ProfileVisibility,
  activityStatus: true,
  compactMode: false,
  animationSpeed: 'normal' as AnimationSpeed,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      setTimezone: (tz) => set({ timezone: tz }),
      toggleNotification: (key) =>
        set((state) => ({ [key]: !state[key] })),
      setProfileVisibility: (val) => set({ profileVisibility: val }),
      toggleActivityStatus: () =>
        set((state) => ({ activityStatus: !state.activityStatus })),
      setCompactMode: (val) => set({ compactMode: val }),
      setAnimationSpeed: (val) => set({ animationSpeed: val }),
      resetToDefault: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'glinteco-settings-storage',
    }
  )
);

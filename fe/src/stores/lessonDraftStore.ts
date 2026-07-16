import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LessonDraftData {
  title: string;
  description: string;
  estimatedTime: string;
  type: 'video' | 'reading' | 'quiz' | 'coding' | 'assignment';
  order: number;
  body: string;
  updatedAt: number;
  isDirty?: boolean;
}

interface LessonDraftState {
  drafts: Record<string, LessonDraftData>;
  saveDraft: (key: string, data: Omit<LessonDraftData, 'updatedAt'>) => void;
  getDraft: (key: string) => LessonDraftData | undefined;
  clearDraft: (key: string) => void;
}

export const useLessonDraftStore = create<LessonDraftState>()(
  persist(
    (set, get) => ({
      drafts: {},
      saveDraft: (key, data) =>
        set((state) => ({
          drafts: {
            ...state.drafts,
            [key]: {
              ...data,
              updatedAt: Date.now(),
            },
          },
        })),
      getDraft: (key) => get().drafts[key],
      clearDraft: (key) =>
        set((state) => {
          const nextDrafts = { ...state.drafts };
          delete nextDrafts[key];
          return { drafts: nextDrafts };
        }),
    }),
    { name: 'lesson-editor-drafts' }
  )
);

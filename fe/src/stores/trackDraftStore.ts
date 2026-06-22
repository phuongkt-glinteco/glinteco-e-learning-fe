import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DraftLesson {
  title: string;
  estimatedTime: string;
  body: string;
}

interface TrackDraftState {
  title: string;
  description: string;
  lessons: DraftLesson[];
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  addLesson: (lesson: DraftLesson) => void;
  updateLesson: (index: number, lesson: DraftLesson) => void;
  removeLesson: (index: number) => void;
  reorderLessons: (lessons: DraftLesson[]) => void;
  reset: () => void;
}

const initialState = {
  title: '',
  description: '',
  lessons: [] as DraftLesson[],
};

export const useTrackDraftStore = create<TrackDraftState>()(
  persist(
    (set) => ({
      ...initialState,
      setTitle: (title) => set({ title }),
      setDescription: (description) => set({ description }),
      addLesson: (lesson) =>
        set((state) => ({ lessons: [...state.lessons, lesson] })),
      updateLesson: (index, lesson) =>
        set((state) => {
          const updated = [...state.lessons];
          updated[index] = lesson;
          return { lessons: updated };
        }),
      removeLesson: (index) =>
        set((state) => ({
          lessons: state.lessons.filter((_, i) => i !== index),
        })),
      reorderLessons: (lessons) => set({ lessons }),
      reset: () => set(initialState),
    }),
    { name: 'track-draft' }
  )
);

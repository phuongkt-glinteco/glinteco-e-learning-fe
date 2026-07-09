export interface LessonExerciseItem {
  id: string;
  title: string;
  type: 'PR_SUBMIT' | 'CODING' | 'QUIZ';
  status: 'active' | 'draft';
  submissionsCount: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface LessonRelativeDocumentItem {
  id: string;
  title: string;
  type: 'PDF' | 'LINK' | 'MARKDOWN' | 'SLIDES';
  url: string;
  sizeOrDuration: string;
  updatedAt: string;
}

// In-memory store for lesson exercises
const exercisesStore: Record<string, LessonExerciseItem[]> = {};

// In-memory store for lesson relative documents
const documentsStore: Record<string, LessonRelativeDocumentItem[]> = {};

export function getLessonExercises(lessonId: string): LessonExerciseItem[] {
  if (!exercisesStore[lessonId]) {
    exercisesStore[lessonId] = [
      {
        id: `ex-${lessonId}-1`,
        title: 'Thực hành nộp PR Pull Request: Triển khai tính năng theo Spec',
        type: 'PR_SUBMIT',
        status: 'active',
        submissionsCount: 14,
        difficulty: 'Medium',
      },
      {
        id: `ex-${lessonId}-2`,
        title: 'Bài tập trắc nghiệm củng cố lý thuyết bài học',
        type: 'QUIZ',
        status: 'active',
        submissionsCount: 22,
        difficulty: 'Easy',
      },
    ];
  }
  return exercisesStore[lessonId];
}

export function addLessonExercise(
  lessonId: string,
  data: Omit<LessonExerciseItem, 'id'>
): LessonExerciseItem {
  const list = getLessonExercises(lessonId);
  const newItem: LessonExerciseItem = {
    ...data,
    id: `ex-${Date.now()}`,
  };
  exercisesStore[lessonId] = [...list, newItem];
  return newItem;
}

export function removeLessonExercise(lessonId: string, exerciseId: string): void {
  const list = getLessonExercises(lessonId);
  exercisesStore[lessonId] = list.filter((item) => item.id !== exerciseId);
}

export function getLessonDocuments(lessonId: string): LessonRelativeDocumentItem[] {
  if (!documentsStore[lessonId]) {
    documentsStore[lessonId] = [
      {
        id: `doc-${lessonId}-1`,
        title: 'Tài liệu hướng dẫn chuẩn Coding Convention & Workflow',
        type: 'PDF',
        url: 'https://docs.glinteco.com/conventions.pdf',
        sizeOrDuration: '2.4 MB',
        updatedAt: '2026-07-08',
      },
      {
        id: `doc-${lessonId}-2`,
        title: 'Slide bài giảng & sơ đồ kiến trúc hệ thống',
        type: 'SLIDES',
        url: 'https://docs.glinteco.com/slides/architecture',
        sizeOrDuration: '24 Slides',
        updatedAt: '2026-07-05',
      },
    ];
  }
  return documentsStore[lessonId];
}

export function addLessonDocument(
  lessonId: string,
  data: Omit<LessonRelativeDocumentItem, 'id'>
): LessonRelativeDocumentItem {
  const list = getLessonDocuments(lessonId);
  const newItem: LessonRelativeDocumentItem = {
    ...data,
    id: `doc-${Date.now()}`,
  };
  documentsStore[lessonId] = [...list, newItem];
  return newItem;
}

export function removeLessonDocument(lessonId: string, docId: string): void {
  const list = getLessonDocuments(lessonId);
  documentsStore[lessonId] = list.filter((item) => item.id !== docId);
}

import { describe, it, expect, beforeEach } from 'vitest';
import { useLessonDraftStore } from './lessonDraftStore';

describe('useLessonDraftStore', () => {
  beforeEach(() => {
    useLessonDraftStore.setState({
      drafts: {},
    });
  });

  it('saves and retrieves a draft with isDirty status', () => {
    const store = useLessonDraftStore.getState();

    store.saveDraft('track-1-lesson-1', {
      title: 'Lesson 1',
      description: 'Desc',
      estimatedTime: '15 min',
      type: 'reading',
      order: 1,
      body: '{"content":[]}',
      isDirty: true,
    });

    const draft = useLessonDraftStore.getState().getDraft('track-1-lesson-1');
    expect(draft).toBeDefined();
    expect(draft?.title).toBe('Lesson 1');
    expect(draft?.isDirty).toBe(true);
    expect(typeof draft?.updatedAt).toBe('number');
  });

  it('saves a clean draft with isDirty false', () => {
    const store = useLessonDraftStore.getState();

    store.saveDraft('track-1-lesson-2', {
      title: 'Lesson 2',
      description: '',
      estimatedTime: '10 min',
      type: 'video',
      order: 2,
      body: '{"content":[]}',
      isDirty: false,
    });

    const draft = useLessonDraftStore.getState().getDraft('track-1-lesson-2');
    expect(draft?.isDirty).toBe(false);
  });

  it('clears a draft properly', () => {
    const store = useLessonDraftStore.getState();

    store.saveDraft('track-1-lesson-3', {
      title: 'Lesson 3',
      description: '',
      estimatedTime: '20 min',
      type: 'quiz',
      order: 3,
      body: '{"content":[]}',
      isDirty: true,
    });

    store.clearDraft('track-1-lesson-3');
    expect(useLessonDraftStore.getState().getDraft('track-1-lesson-3')).toBeUndefined();
  });
});

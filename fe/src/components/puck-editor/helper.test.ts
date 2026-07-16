import { describe, it, expect } from 'vitest';
import { serializePuckDataToPayload, parseBodyToPuckData, deriveLessonSidebarState } from './helper';
import type { LessonPuckData } from './types';

describe('helper', () => {
  describe('serializePuckDataToPayload', () => {
    it('serializes Puck data into payload extracting title, description, order, time, and type cleanly', () => {
      const mockData: LessonPuckData = {
        root: {
          props: {
            title: 'Root Title',
            description: 'Root Desc',
            order: 2,
            estimatedTime: '20 min',
            type: 'quiz',
          },
        },
        content: [],
        zones: {},
      };

      const result = serializePuckDataToPayload(mockData);

      expect(result.title).toBe('Root Title');
      expect(result.description).toBe('Root Desc');
      expect(result.order).toBe(2);
      expect(result.estimatedTime).toBe('20 min');
      expect(result.type).toBe('quiz');
      expect(JSON.parse(result.body)).toEqual(mockData);
    });

    it('uses fallback values if properties are missing in root or header block', () => {
      const mockData: LessonPuckData = {
        root: { props: {} as any },
        content: [],
        zones: {},
      };

      const result = serializePuckDataToPayload(mockData, {
        title: 'Fallback Title',
        description: 'Fallback Desc',
        order: 5,
        estimatedTime: '30 min',
        type: 'coding',
      });

      expect(result.title).toBe('Fallback Title');
      expect(result.description).toBe('Fallback Desc');
      expect(result.order).toBe(5);
      expect(result.estimatedTime).toBe('30 min');
      expect(result.type).toBe('coding');
    });
  });

  describe('parseBodyToPuckData', () => {
    it('parses valid JSON string body into LessonPuckData and injects fallback props if root missing', () => {
      const bodyObj = {
        root: { props: { title: 'Parsed Title' } },
        content: [{ type: 'HeadingBlock', props: { title: 'Hello' } }],
        zones: {},
      };
      const body = JSON.stringify(bodyObj);

      const parsed = parseBodyToPuckData(body, {
        title: 'Fallback Title',
        description: 'Fallback Desc',
      });

      expect(parsed.root?.props?.title).toBe('Parsed Title');
      expect(parsed.content?.length).toBe(1);
    });
  });

  describe('deriveLessonSidebarState', () => {
    it('extracts exercises from both block.props.content and block.props.exerciseData', () => {
      const content = [
        {
          type: 'SingleExerciseBlock',
          props: {
            content: {
              exerciseId: 'ex-1',
              title: 'Exercise via content',
              status: 'complete' as const,
              type: 'PR_REVIEW' as const,
            },
          },
        },
        {
          type: 'SingleExerciseBlock',
          props: {
            exerciseData: {
              exerciseId: 'ex-2',
              title: 'Exercise via exerciseData',
              status: 'draft' as const,
              type: 'QUIZ' as const,
            },
          },
        },
      ];

      const result = deriveLessonSidebarState(content, {
        defaultExerciseTitle: 'Default Ex',
        defaultDocTitle: 'Default Doc',
      });

      expect(result.exercises).toHaveLength(2);
      expect(result.exercises[0]).toEqual({
        id: 'ex-1',
        exerciseId: 'ex-1',
        title: 'Exercise via content',
        status: 'complete',
        type: 'PR_REVIEW',
        isMandatory: false,
        blockIndex: 0,
        content: {
          exerciseId: 'ex-1',
          title: 'Exercise via content',
          status: 'complete',
          type: 'PR_REVIEW',
        },
      });
      expect(result.exercises[1]).toEqual({
        id: 'ex-2',
        exerciseId: 'ex-2',
        title: 'Exercise via exerciseData',
        status: 'draft',
        type: 'QUIZ',
        isMandatory: false,
        blockIndex: 1,
        content: {
          exerciseId: 'ex-2',
          title: 'Exercise via exerciseData',
          status: 'draft',
          type: 'QUIZ',
        },
      });
    });

    it('prioritizes rootProps.exercises and rootProps.documents when provided (Single Source of Truth)', () => {
      const content = [
        {
          type: 'SingleExerciseBlock',
          props: {
            content: { exerciseId: 'canvas-ex-1', title: 'Canvas Ex' },
          },
        },
      ];
      const rootProps = {
        exercises: [
          { exerciseId: 'ssot-ex-1', title: 'SSOT Ex 1', isMandatory: true, type: 'QUIZ' },
        ],
        documents: [
          { id: 'ssot-doc-1', title: 'SSOT Doc 1', url: 'https://example.com' },
        ],
        headings: [
          { id: 'ssot-heading-1', title: 'SSOT Heading 1', level: 1 },
        ],
      };

      const result = deriveLessonSidebarState(
        content,
        { defaultExerciseTitle: 'Default Ex', defaultDocTitle: 'Default Doc' },
        rootProps
      );

      expect(result.exercises).toEqual([
        {
          id: 'ssot-ex-1',
          exerciseId: 'ssot-ex-1',
          title: 'SSOT Ex 1',
          status: 'complete',
          type: 'QUIZ',
          isMandatory: true,
          blockIndex: 0,
        },
      ]);
      expect(result.documents).toEqual([
        {
          id: 'ssot-doc-1',
          title: 'SSOT Doc 1',
          url: 'https://example.com',
        },
      ]);
      expect(result.headings).toEqual([
        {
          id: 'ssot-heading-1',
          text: 'SSOT Heading 1',
          level: 1,
        },
      ]);
    });
  });
});


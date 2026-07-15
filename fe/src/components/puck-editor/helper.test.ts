import { describe, it, expect } from 'vitest';
import { serializePuckDataToPayload, parseBodyToPuckData } from './helper';
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
});

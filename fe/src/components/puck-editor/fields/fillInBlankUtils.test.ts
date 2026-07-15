import { describe, it, expect } from 'vitest';
import {
  parseFillInBlankTokens,
  validateFillInBlankAnswers,
  resolveQuestionId,
} from './fillInBlankUtils';

describe('fillInBlankUtils', () => {
  describe('parseFillInBlankTokens', () => {
    it('correctly splits template with canonical [id_length] tokens and preserves newlines', () => {
      const template = 'Line 1: Hello [1_5] world.\nLine 2: Test [2_12] end.';
      const result = parseFillInBlankTokens(template);

      expect(result.parts).toEqual([
        'Line 1: Hello ',
        '[1_5]',
        ' world.\nLine 2: Test ',
        '[2_12]',
        ' end.',
      ]);
      expect(result.tokens).toEqual([
        { id: '1', length: 5, raw: '[1_5]', partIndex: 1 },
        { id: '2', length: 12, raw: '[2_12]', partIndex: 3 },
      ]);
    });

    it('ignores non-canonical tokens like [[1_5]], {{1}}, or invalid brackets [abc_xyz]', () => {
      const template = 'Check [[1_5]] and {{2}} and [abc_xyz] and [3_4] ok.';
      const result = parseFillInBlankTokens(template);

      expect(result.tokens).toEqual([
        { id: '3', length: 4, raw: '[3_4]', partIndex: 1 },
      ]);
    });
  });

  describe('resolveQuestionId & validateFillInBlankAnswers', () => {
    it('resolves raw token id to question.id correctly', () => {
      const questions = [
        { id: 'q-uuid-abc', prompt: 'First' },
        { id: 'q-uuid-def', prompt: 'Second' },
      ];
      expect(resolveQuestionId('q-uuid-abc', questions)).toBe('q-uuid-abc');
      expect(resolveQuestionId('0', questions)).toBe('q-uuid-abc');
      expect(resolveQuestionId('1', questions)).toBe('q-uuid-def');
      expect(resolveQuestionId('999', questions)).toBe('999');
    });

    it('validates answers based on resolved question ids and returns missing ids', () => {
      const questions = [
        { id: 'q-uuid-1' },
        { id: 'q-uuid-2' },
      ];
      const rawTokens = ['0', '1'];

      // When q-uuid-1 has answer but q-uuid-2 is empty
      const answers = {
        'q-uuid-1': '   correct answer   ',
        'q-uuid-2': '   ',
      };

      const validation = validateFillInBlankAnswers(questions, answers, rawTokens);
      expect(validation.isValid).toBe(false);
      expect(validation.missingIds).toEqual(['q-uuid-2']);
    });
  });
});

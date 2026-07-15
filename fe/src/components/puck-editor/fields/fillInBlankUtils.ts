export interface FillInBlankToken {
  id: string;
  length?: number;
  raw: string;
  partIndex: number;
}

export interface ParseFillInBlankResult {
  parts: string[];
  tokens: FillInBlankToken[];
}

/**
 * Splits template by canonical [id_length] tokens and extracts token metadata.
 * Only exact [id_length] tokens where id and length are natural numbers are parsed.
 */
export function parseFillInBlankTokens(template: string): ParseFillInBlankResult {
  if (!template) {
    return { parts: [], tokens: [] };
  }

  const parts = template.split(/(?<!\[)(\[\d+_\d+\])(?!\])/g);
  const tokens: FillInBlankToken[] = [];

  parts.forEach((part, index) => {
    const match = part.match(/^\[(\d+)_(\d+)\]$/);
    if (match) {
      tokens.push({
        id: match[1].trim(),
        length: Number(match[2]),
        raw: part,
        partIndex: index,
      });
    }
  });

  return { parts, tokens };
}

/**
 * Resolves a raw token key (either UUID string or index string like "0", "1")
 * to the canonical question.id from the questions array.
 */
export function resolveQuestionId(
  rawKey: string,
  questions: Array<{ id: string; prompt?: string }>
): string {
  if (!questions || questions.length === 0) return rawKey;

  const foundById = questions.find((q) => q.id === rawKey);
  if (foundById) return foundById.id;

  const index = Number(rawKey);
  if (!isNaN(index) && questions[index]) {
    return questions[index].id;
  }

  return rawKey;
}

/**
 * Validates that all blanks (either templateTokens or questions) have non-empty answers
 * inside the answers map.
 */
export function validateFillInBlankAnswers(
  questions: Array<{ id: string; prompt?: string }>,
  answers: Record<string, string>,
  rawTokens?: string[]
): { isValid: boolean; missingIds: string[] } {
  const missingIds: string[] = [];
  const checkedIds = new Set<string>();

  if (rawTokens && rawTokens.length > 0) {
    rawTokens.forEach((rawToken) => {
      const qId = resolveQuestionId(rawToken, questions);
      if (!checkedIds.has(qId)) {
        checkedIds.add(qId);
        const val = (answers[qId] || '').trim();
        if (!val) {
          missingIds.push(qId);
        }
      }
    });
  } else {
    questions.forEach((q) => {
      if (!checkedIds.has(q.id)) {
        checkedIds.add(q.id);
        const val = (answers[q.id] || '').trim();
        if (!val) {
          missingIds.push(q.id);
        }
      }
    });
  }

  return {
    isValid: missingIds.length === 0,
    missingIds,
  };
}

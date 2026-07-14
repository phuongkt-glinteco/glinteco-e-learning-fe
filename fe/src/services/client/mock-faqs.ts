import { ApiError } from '../errors';
import {
  type FaqDto,
  type FaqCreateDto,
  type FaqUpdateDto,
  INITIAL_MOCK_FAQS,
} from '@/mocks/faq';

const STORAGE_KEY = 'mock_faqs_storage_v1';

function getStoredFaqs(): FaqDto[] {
  if (typeof window === 'undefined') return INITIAL_MOCK_FAQS;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_FAQS));
    return INITIAL_MOCK_FAQS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_FAQS));
    return INITIAL_MOCK_FAQS;
  }
}

function saveStoredFaqs(faqs: FaqDto[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(faqs));
  }
}

function simulateDelay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function faqControllerFindAll(options?: {
  query?: { category?: string; q?: string };
}): Promise<{ data: FaqDto[] }> {
  await simulateDelay(300);
  const faqs = getStoredFaqs();
  const category = options?.query?.category;
  const q = options?.query?.q?.toLowerCase()?.trim();

  const filtered = faqs.filter((item) => {
    if (category && category !== 'all' && item.category !== category) {
      return false;
    }
    if (q) {
      const matchVi = item.question.vi.toLowerCase().includes(q) || item.answer.vi.toLowerCase().includes(q);
      const matchEn = item.question.en.toLowerCase().includes(q) || item.answer.en.toLowerCase().includes(q);
      return matchVi || matchEn;
    }
    return true;
  });

  return { data: filtered.sort((a, b) => a.order - b.order) };
}

export async function faqControllerCreate(options: {
  body: FaqCreateDto;
}): Promise<{ data: FaqDto }> {
  await simulateDelay(400);
  const { category, questionVi, questionEn, answerVi, answerEn, order } = options.body;

  if (!questionVi.trim() || !questionEn.trim() || !answerVi.trim() || !answerEn.trim() || !category) {
    throw new ApiError('VALIDATION_ERROR', 'All fields (Vietnamese & English questions/answers and category) are required.', 400, '/faqs');
  }

  const faqs = getStoredFaqs();
  const newId = `faq-${Date.now()}`;
  const maxOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.order)) : 0;

  const newFaq: FaqDto = {
    id: newId,
    category,
    question: {
      vi: questionVi.trim(),
      en: questionEn.trim(),
    },
    answer: {
      vi: answerVi.trim(),
      en: answerEn.trim(),
    },
    order: order ?? maxOrder + 1,
    createdAt: new Date().toISOString(),
  };

  const updated = [...faqs, newFaq];
  saveStoredFaqs(updated);
  return { data: newFaq };
}

export async function faqControllerUpdate(options: {
  path: { id: string };
  body: FaqUpdateDto;
}): Promise<{ data: FaqDto }> {
  await simulateDelay(350);
  const { id } = options.path;
  const faqs = getStoredFaqs();
  const index = faqs.findIndex((f) => f.id === id);

  if (index === -1) {
    throw new ApiError('NOT_FOUND', `FAQ item with id ${id} not found`, 404, `/faqs/${id}`);
  }

  const current = faqs[index];
  const updatedFaq: FaqDto = {
    ...current,
    category: options.body.category ?? current.category,
    question: {
      vi: options.body.questionVi !== undefined ? options.body.questionVi.trim() : current.question.vi,
      en: options.body.questionEn !== undefined ? options.body.questionEn.trim() : current.question.en,
    },
    answer: {
      vi: options.body.answerVi !== undefined ? options.body.answerVi.trim() : current.answer.vi,
      en: options.body.answerEn !== undefined ? options.body.answerEn.trim() : current.answer.en,
    },
    order: options.body.order !== undefined ? options.body.order : current.order,
    updatedAt: new Date().toISOString(),
  };

  faqs[index] = updatedFaq;
  saveStoredFaqs(faqs);
  return { data: updatedFaq };
}

export async function faqControllerDelete(options: {
  path: { id: string };
}): Promise<{ success: boolean }> {
  await simulateDelay(300);
  const { id } = options.path;
  const faqs = getStoredFaqs();
  const exists = faqs.some((f) => f.id === id);

  if (!exists) {
    throw new ApiError('NOT_FOUND', `FAQ item with id ${id} not found`, 404, `/faqs/${id}`);
  }

  const filtered = faqs.filter((f) => f.id !== id);
  saveStoredFaqs(filtered);
  return { success: true };
}

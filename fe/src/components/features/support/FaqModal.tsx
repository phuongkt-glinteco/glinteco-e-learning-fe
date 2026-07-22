'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/default/dialog';
import { type FaqDto, type FaqCategory, type FaqCreateDto, type FaqUpdateDto } from '@/mocks/faq';

interface FaqModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FaqDto | null;
  onSave: (data: FaqCreateDto | FaqUpdateDto) => Promise<void>;
}

export function FaqModal({ open, onOpenChange, initialData, onSave }: FaqModalProps) {
  const t = useTranslations('SupportPage');
  const [category, setCategory] = useState<FaqCategory>('setup');
  const [questionVi, setQuestionVi] = useState('');
  const [questionEn, setQuestionEn] = useState('');
  const [answerVi, setAnswerVi] = useState('');
  const [answerEn, setAnswerEn] = useState('');
  const [order, setOrder] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setErrorMsg(null);
      if (initialData) {
        setCategory(initialData.category);
        setQuestionVi(initialData.question.vi || '');
        setQuestionEn(initialData.question.en || '');
        setAnswerVi(initialData.answer.vi || '');
        setAnswerEn(initialData.answer.en || '');
        setOrder(initialData.order);
      } else {
        setCategory('setup');
        setQuestionVi('');
        setQuestionEn('');
        setAnswerVi('');
        setAnswerEn('');
        setOrder('');
      }
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionVi.trim() || !questionEn.trim() || !answerVi.trim() || !answerEn.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ câu hỏi và câu trả lời ở cả 2 ngôn ngữ (Tiếng Việt & Tiếng Anh).');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    try {
      const payload = {
        category,
        questionVi: questionVi.trim(),
        questionEn: questionEn.trim(),
        answerVi: answerVi.trim(),
        answerEn: answerEn.trim(),
        order: typeof order === 'number' ? order : undefined,
      };
      await onSave(payload);
      onOpenChange(false);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi lưu câu hỏi FAQ.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto p-6 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-xl text-on-surface">
        <DialogHeader className="mb-4 pb-3 border-b border-outline-variant/20">
          <DialogTitle className="flex items-center gap-2.5 font-heading text-xl font-bold">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span>{initialData ? t('modalEditFaqTitle') : t('modalAddFaqTitle')}</span>
          </DialogTitle>
        </DialogHeader>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t('faqCategoryLabel')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FaqCategory)}
                disabled={isSaving}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                <option value="setup">{t('catSetup')}</option>
                <option value="git">{t('catGit')}</option>
                <option value="grading">{t('catGrading')}</option>
                <option value="account">{t('catAccount')}</option>
                <option value="other">Other / General</option>
              </select>
            </div>

            {/* Display Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t('faqOrderLabel')}
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value ? Number(e.target.value) : '')}
                placeholder="Auto"
                disabled={isSaving}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Vietnamese Question */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {t('faqQuestionViLabel')}
            </label>
            <input
              type="text"
              value={questionVi}
              onChange={(e) => setQuestionVi(e.target.value)}
              required
              disabled={isSaving}
              placeholder="Nhập câu hỏi bằng tiếng Việt..."
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* English Question */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {t('faqQuestionEnLabel')}
            </label>
            <input
              type="text"
              value={questionEn}
              onChange={(e) => setQuestionEn(e.target.value)}
              required
              disabled={isSaving}
              placeholder="Enter question in English..."
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* Vietnamese Answer */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {t('faqAnswerViLabel')}
            </label>
            <textarea
              value={answerVi}
              onChange={(e) => setAnswerVi(e.target.value)}
              required
              rows={3}
              disabled={isSaving}
              placeholder="Nhập câu trả lời bằng tiếng Việt (hỗ trợ markdown cơ bản)..."
              className="w-full p-3 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-y min-h-[80px]"
            />
          </div>

          {/* English Answer */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {t('faqAnswerEnLabel')}
            </label>
            <textarea
              value={answerEn}
              onChange={(e) => setAnswerEn(e.target.value)}
              required
              rows={3}
              disabled={isSaving}
              placeholder="Enter answer in English (supports basic markdown)..."
              className="w-full p-3 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-y min-h-[80px]"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-outline-variant/60 text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            >
              {t('cancelBtn')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary-container hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('savingFaq')}</span>
                </>
              ) : (
                <span>{t('saveFaqBtn')}</span>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

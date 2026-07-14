'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, Ticket, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/default/dialog';
import { type TicketTopic, type TicketSeverity, type CreateTicketDto } from '@/mocks/support-tickets';
import { useAuth } from '@/providers/AuthProvider';

interface CreateTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
  onSubmitTicket: (data: CreateTicketDto) => Promise<void>;
}

export function CreateTicketModal({ open, onOpenChange, onSubmitted, onSubmitTicket }: CreateTicketModalProps) {
  const t = useTranslations('SupportPage');
  const { user } = useAuth();
  const [topic, setTopic] = useState<TicketTopic>('setup');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<TicketSeverity>('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTopic('setup');
      setSubject('');
      setDescription('');
      setSeverity('normal');
      setErrorMsg(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ tiêu đề và chi tiết vấn đề bạn đang gặp phải.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await onSubmitTicket({
        topic,
        subject: subject.trim(),
        description: description.trim(),
        severity,
        learnerId: user?.id || 'usr_002',
        learnerName: user?.name || 'Trần Lan',
        learnerEmail: user?.email || 'lan.tran@company.com',
        learnerCohort: 'Onboarding 2024 - Q1',
        learnerAvatarInitials: user?.name ? user.name.slice(0, 2).toUpperCase() : 'TL',
      });
      onOpenChange(false);
      onSubmitted();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi gửi yêu cầu hỗ trợ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto p-6 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-xl text-on-surface">
        <DialogHeader className="mb-4 pb-3 border-b border-outline-variant/20">
          <DialogTitle className="flex items-center gap-2.5 font-heading text-xl font-bold">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <span>{t('newTicketBtn')}</span>
          </DialogTitle>
        </DialogHeader>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Topic Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t('ticketTopic')} *
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as TicketTopic)}
                disabled={isSubmitting}
                className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
              >
                <option value="setup">{t('catSetup')}</option>
                <option value="doc">Tài liệu & Bài giảng</option>
                <option value="access">Quyền truy cập / Tài khoản</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* Severity Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t('ticketSeverity')} *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSeverity('normal')}
                  disabled={isSubmitting}
                  className={`h-10 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    severity === 'normal'
                      ? 'bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span>Bình thường</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSeverity('urgent')}
                  disabled={isSubmitting}
                  className={`h-10 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    severity === 'urgent'
                      ? 'bg-error/15 border-error text-error shadow-xs'
                      : 'bg-surface-container-low border-outline-variant text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Khẩn cấp</span>
                </button>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              {t('ticketSubject')} *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Ví dụ: Lỗi không build được container docker tại port 6336..."
              className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Mô tả chi tiết *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              disabled={isSubmitting}
              placeholder="Mô tả cụ thể các bước tái hiện lỗi, log lỗi, hoặc thắc mắc của bạn để mentor hỗ trợ nhanh chóng nhất..."
              className="w-full p-3 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-y"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-outline-variant/60 text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
            >
              {t('cancelBtn')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary-container hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('savingFaq')}</span>
                </>
              ) : (
                <span>Gửi yêu cầu ngay</span>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

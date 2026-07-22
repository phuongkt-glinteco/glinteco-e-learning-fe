'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Plus, Edit, Trash2, HelpCircle, ArrowLeft, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/default/alert-dialog';
import { type FaqDto, type FaqCreateDto, type FaqUpdateDto } from '@/mocks/faq';
import { faqControllerFindAll, faqControllerCreate, faqControllerUpdate, faqControllerDelete } from '@/services/api-client';
import { FaqModal } from './FaqModal';

export function FaqAdminClient() {
  const t = useTranslations('SupportPage');
  const locale = useLocale() as 'vi' | 'en';

  const [faqs, setFaqs] = useState<FaqDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqDto | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<FaqDto | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadFaqs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await faqControllerFindAll({
        query: { category: selectedCategory === 'all' ? undefined : selectedCategory, q: searchQuery },
      });
      setFaqs(res.data);
    } catch (err) {
      console.error('Failed to load admin FAQs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadFaqs();
  }, [loadFaqs]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingFaq(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (faq: FaqDto) => {
    setEditingFaq(faq);
    setModalOpen(true);
  };

  const handleSaveFaq = async (data: FaqCreateDto | FaqUpdateDto) => {
    if (editingFaq) {
      await faqControllerUpdate({
        path: { id: editingFaq.id },
        body: data as FaqUpdateDto,
      });
      showToast(t('faqSavedToast'));
    } else {
      await faqControllerCreate({
        body: data as FaqCreateDto,
      });
      showToast(t('faqSavedToast'));
    }
    loadFaqs();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFaq) return;
    try {
      await faqControllerDelete({
        path: { id: deletingFaq.id },
      });
      showToast(t('faqDeletedToast'));
      setDeletingFaq(null);
      loadFaqs();
    } catch (err: any) {
      alert(err?.message || 'Có lỗi xảy ra khi xóa FAQ.');
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'setup':
        return <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">Setup</span>;
      case 'git':
        return <span className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase">Git</span>;
      case 'grading':
        return <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">Grading</span>;
      case 'account':
        return <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase">Account</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-bold text-xs uppercase">{cat}</span>;
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-8 text-on-surface animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Link href="/support" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trang FAQ chính</span>
            </Link>
            <span>/</span>
            <span>Admin Control Panel</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-on-surface flex items-center gap-2.5">
            <HelpCircle className="w-7 h-7 text-primary" />
            <span>Quản Trị Kho Kiến Thức FAQ</span>
          </h1>
          <p className="text-sm text-on-surface-variant">
            Quản lý, chỉnh sửa đa ngôn ngữ (Tiếng Việt & Tiếng Anh) và sắp xếp thứ tự các câu hỏi thường gặp cho học viên.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="px-5 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:bg-primary-container hover:shadow-lg transition-all flex items-center justify-center gap-2 self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>{t('addFaqBtn')}</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/40 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm câu hỏi hoặc câu trả lời..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-outline-variant bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
          >
            <option value="all">Tất cả chủ đề</option>
            <option value="setup">Setup & Cài đặt</option>
            <option value="git">Git Workflow</option>
            <option value="grading">Chấm điểm tự động</option>
            <option value="account">Tài khoản & Phân quyền</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>

      {/* FAQ Table / List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
          <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-semibold text-on-surface-variant">Đang tải danh sách FAQ...</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-on-surface-variant/40" />
          <p className="text-base font-bold text-on-surface">Không tìm thấy câu hỏi nào</p>
          <p className="text-xs text-on-surface-variant max-w-sm">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc nhấn nút Thêm câu hỏi FAQ phía trên để tạo mới.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/70 border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">STT</th>
                  <th className="py-3.5 px-4 w-28">Chủ đề</th>
                  <th className="py-3.5 px-6">Câu hỏi (VI & EN)</th>
                  <th className="py-3.5 px-6">Trích dẫn câu trả lời</th>
                  <th className="py-3.5 px-4 w-28 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-sm">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-4 px-4 text-center font-bold text-on-surface-variant">
                      #{faq.order}
                    </td>
                    <td className="py-4 px-4">
                      {getCategoryBadge(faq.category)}
                    </td>
                    <td className="py-4 px-6 space-y-1">
                      <div className="font-semibold text-on-surface leading-snug">
                        {faq.question.vi || '—'}
                      </div>
                      <div className="text-xs text-on-surface-variant italic leading-snug">
                        {faq.question.en || '—'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant text-xs leading-relaxed max-w-md line-clamp-2">
                      {faq.answer[locale] || faq.answer.vi}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(faq)}
                          title="Chỉnh sửa FAQ"
                          className="p-2 rounded-lg border border-outline-variant/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors text-on-surface-variant cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingFaq(faq)}
                          title="Xóa FAQ"
                          className="p-2 rounded-lg border border-outline-variant/40 hover:bg-error/10 hover:border-error/30 hover:text-error transition-colors text-on-surface-variant cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add/Edit FAQ */}
      <FaqModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingFaq}
        onSave={handleSaveFaq}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFaq} onOpenChange={(open) => !open && setDeletingFaq(null)}>
        <AlertDialogContent className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-xl max-w-md text-on-surface">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-lg font-bold text-error flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>{t('deleteConfirmTitle')}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-on-surface-variant leading-relaxed">
              {t('deleteConfirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel
              onClick={() => setDeletingFaq(null)}
              className="rounded-xl border border-outline-variant text-xs font-semibold px-4 py-2 hover:bg-surface-container"
            >
              {t('cancelBtn')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="rounded-xl bg-error text-on-error font-bold text-xs px-4 py-2 hover:bg-error/90 shadow-md"
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast */}
      <div
        className={`fixed bottom-8 right-8 bg-inverse-surface dark:bg-surface-container-highest text-inverse-on-surface dark:text-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-500 z-50 border border-outline-variant/20 ${
          toastMsg ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95 pointer-events-none'
        }`}
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <p className="font-label-md text-sm font-bold">{toastMsg}</p>
      </div>
    </div>
  );
}

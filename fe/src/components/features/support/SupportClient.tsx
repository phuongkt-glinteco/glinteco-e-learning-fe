'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Plus, Edit, Trash2, HelpCircle, ArrowRight, CheckCircle2, ShieldCheck, LifeBuoy } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/default/accordion';
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
import { type FaqDto, type FaqCategory, type FaqCreateDto, type FaqUpdateDto } from '@/mocks/faq';
import { faqControllerFindAll, faqControllerCreate, faqControllerUpdate, faqControllerDelete } from '@/services/api-client';
import { FaqModal } from './FaqModal';

export function SupportClient() {
  const t = useTranslations('SupportPage');
  const locale = useLocale() as 'vi' | 'en';
  const { user } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';

  // State cho danh sách FAQ từ API
  const [faqs, setFaqs] = useState<FaqDto[]>([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({});

  // State cho Modal Admin CRUD
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqDto | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<FaqDto | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadFaqs = useCallback(async () => {
    setIsLoadingFaqs(true);
    try {
      const res = await faqControllerFindAll({
        query: { category: selectedCategory === 'all' ? undefined : selectedCategory, q: searchQuery },
      });
      setFaqs(res.data);
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setIsLoadingFaqs(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadFaqs();
  }, [loadFaqs]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  const handleOpenCreateModal = () => {
    setEditingFaq(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (faq: FaqDto, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFaq(faq);
    setModalOpen(true);
  };

  const handleOpenDeleteConfirm = (faq: FaqDto, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingFaq(faq);
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
      alert(err?.message || 'Có lỗi khi xóa câu hỏi FAQ');
    }
  };

  const handleFeedback = (faqId: string, isHelpful: boolean) => {
    setHelpfulFeedback((prev) => ({ ...prev, [faqId]: isHelpful }));
  };

  const getQuestionText = (item: FaqDto): string => {
    if (item.question && item.question[locale]) {
      return item.question[locale];
    }
    if (item.titleKey) {
      try {
        const translated = t(item.titleKey);
        if (translated && translated !== item.titleKey) return translated;
      } catch {}
    }
    return item.question?.vi || item.question?.en || 'FAQ Question';
  };

  const getAnswerText = (item: FaqDto): string => {
    if (item.answer && item.answer[locale]) {
      return item.answer[locale];
    }
    if (item.contentKey) {
      try {
        const translated = t(item.contentKey);
        if (translated && translated !== item.contentKey) return translated;
      } catch {}
    }
    return item.answer?.vi || item.answer?.en || 'FAQ Answer';
  };

  const categories = [
    { id: 'all', label: t('allCategories'), icon: 'lucide:grid' },
    { id: 'setup', label: t('catSetup'), icon: 'lucide:terminal' },
    { id: 'git', label: t('catGit'), icon: 'lucide:git-pull-request' },
    { id: 'grading', label: t('catGrading'), icon: 'lucide:check-circle-2' },
    { id: 'account', label: t('catAccount'), icon: 'lucide:shield-check' },
  ];

  return (
    <div className="flex-1 p-4 sm:p-8 lg:p-12 max-w-container-max mx-auto w-full relative animate-fade-in text-on-surface">
      {/* Admin FAQ Banner if Admin */}
      {isAdmin && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-sm sm:text-base font-bold text-on-surface">{t('adminFaqBannerTitle')}</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">{t('adminFaqBannerDesc')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addFaqBtn')}</span>
            </button>
            <Link
              href="/admin/faqs"
              className="px-3.5 py-2 rounded-xl bg-surface-container border border-outline-variant text-xs font-semibold hover:bg-surface-container-high transition-colors text-on-surface flex items-center gap-1.5"
            >
              <span>Quản lý riêng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <header className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/15 via-surface-container-low to-tertiary/10 p-6 sm:p-8 border border-outline-variant/30 shadow-sm">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-primary font-bold mb-3">
          <span className="p-1.5 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <LifeBuoy className="w-5 h-5 animate-spin-slow" />
          </span>
          <span className="font-label-md text-xs uppercase tracking-widest font-black">{t('subTitle')}</span>
        </div>
        <h1 className="font-display-lg text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 tracking-tight bg-gradient-to-r from-on-surface to-on-surface-variant bg-clip-text text-transparent">
          {t('title')}
        </h1>
        <p className="font-body-lg text-body-md sm:text-body-lg text-on-surface-variant max-w-3xl leading-relaxed">
          {t('description')}
        </p>
      </header>

      {/* Quick Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs hover:border-primary/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <Icon icon="lucide:zap" className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-black text-on-surface">{t('stat1Value')}</div>
            <div className="text-xs text-on-surface-variant font-medium">{t('stat1Label')}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs hover:border-primary/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
            <Icon icon="lucide:users" className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-black text-on-surface">{t('stat2Value')}</div>
            <div className="text-xs text-on-surface-variant font-medium">{t('stat2Label')}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs hover:border-primary/40 transition-all">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Icon icon="lucide:check-check" className="w-6 h-6" />
          </div>
          <div>
            <div className="text-lg font-black text-on-surface">{t('stat3Value')}</div>
            <div className="text-xs text-on-surface-variant font-medium">{t('stat3Label')}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: FAQ (Left/7cols) vs Overview / Actions (Right/5cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: FAQ Knowledge Base */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-xl sm:text-2xl font-bold flex items-center gap-2 text-on-surface">
                <Icon icon="lucide:book-open" className="w-6 h-6 text-primary" />
                <span>{t('faqTitle')}</span>
              </h2>
              <p className="text-sm text-on-surface-variant">{t('faqSubtitle')}</p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addFaqBtn')}</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Icon icon="lucide:search" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full h-11 pl-10 pr-10 rounded-xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-surface-container text-on-surface-variant/60 hover:text-on-surface cursor-pointer transition-colors"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-sm scale-[1.02]'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-outline-variant/30'
                  }`}
                >
                  <Icon icon={cat.icon} className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* FAQ Accordion List */}
          {isLoadingFaqs ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
              <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-on-surface-variant font-medium">Đang tải câu hỏi FAQ từ API...</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant/40">
                <Icon icon="lucide:help-circle" className="w-8 h-8" />
              </div>
              <p className="text-base font-semibold text-on-surface">{t('noFaqResults')}</p>
              <p className="text-sm text-on-surface-variant max-w-md">{t('noFaqResultsDesc')}</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 px-4 py-2 bg-primary/10 text-primary font-semibold text-xs rounded-lg hover:bg-primary/20 transition-colors cursor-pointer"
              >
                {t('clearSearch')}
              </button>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-3.5">
              {faqs.map((faq) => {
                const feedbackGiven = helpfulFeedback[faq.id] !== undefined;
                return (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-5 shadow-xs hover:border-primary/30 transition-colors overflow-hidden group"
                  >
                    <div className="flex items-center justify-between py-4 pr-1 gap-3">
                      <AccordionTrigger className="text-base font-semibold text-on-surface hover:text-primary flex-1 py-0 text-left leading-snug">
                        <span>{getQuestionText(faq)}</span>
                      </AccordionTrigger>

                      {/* Admin Inline Edit/Delete buttons */}
                      {isAdmin && (
                        <div className="flex items-center gap-1.5 flex-shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditModal(faq, e)}
                            title={t('editFaqBtn')}
                            className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors text-on-surface-variant cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenDeleteConfirm(faq, e)}
                            title={t('deleteFaqBtn')}
                            className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-error/10 hover:border-error/30 hover:text-error transition-colors text-on-surface-variant cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <AccordionContent className="pt-2 pb-5 text-sm text-on-surface-variant leading-relaxed space-y-4 border-t border-outline-variant/20">
                      <p className="whitespace-pre-wrap">{getAnswerText(faq)}</p>

                      {/* Helpful Feedback Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10 text-xs">
                        <span className="text-on-surface-variant/70 font-medium">{t('helpfulQuestion')}</span>
                        {feedbackGiven ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold animate-fade-in">
                            <Icon icon="lucide:check-circle" className="w-4 h-4" />
                            {t('feedbackThanks')}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleFeedback(faq.id, true)}
                              className="px-2.5 py-1 rounded border border-outline-variant/40 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-600 transition-colors cursor-pointer font-medium"
                            >
                              {t('yes')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFeedback(faq.id, false)}
                              className="px-2.5 py-1 rounded border border-outline-variant/40 hover:bg-error/10 hover:border-error/30 hover:text-error transition-colors cursor-pointer font-medium"
                            >
                              {t('no')}
                            </button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>

        {/* Right Column: Overview Card or Admin Management Links */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          {isAdmin ? (
            /* Admin Management Hub Card */
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/20">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-on-surface">Cổng Quản Trị Hỗ Trợ</h3>
                  <p className="text-xs text-on-surface-variant">Quyền Admin hệ thống đào tạo</p>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Bạn đang truy cập với tư cách Admin. Bạn có thể thêm, sửa đổi hoặc xóa các câu hỏi FAQ ngay trên danh sách bên trái bằng các nút nhanh gọn, hoặc truy cập các trang quản trị riêng bên dưới.
              </p>

              <div className="space-y-3 pt-2">
                <Link
                  href="/admin/support-tickets"
                  className="w-full p-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold">
                      <Icon icon="lucide:ticket" className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-primary group-hover:underline">Quản lý Support Ticket</div>
                      <div className="text-[11px] text-on-surface-variant">Xem, phản hồi và xử lý ticket học viên</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/admin/faqs"
                  className="w-full p-4 rounded-xl bg-surface-container border border-outline-variant/40 hover:bg-surface-container-high transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface group-hover:underline">Trang Quản Trị FAQ</div>
                      <div className="text-[11px] text-on-surface-variant">Danh sách, tìm kiếm và tạo mới câu hỏi</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ) : (
            /* Learner Support Overview Card & Navigation */
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/20">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Icon icon="lucide:message-square-plus" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-on-surface">{t('supportOverviewBoxTitle')}</h3>
                  <p className="text-xs text-on-surface-variant">{t('supportOverviewBoxDesc')}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Kết nối trực tiếp tới đội ngũ kỹ thuật & mentor</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Hội thoại trực tuyến, lưu log và theo dõi trạng thái xử lý</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Cập nhật liên tục, không thất lạc yêu cầu</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/support/tickets?action=create')}
                  className="w-full h-11 bg-primary text-on-primary rounded-xl font-label-md text-sm font-bold shadow-md hover:bg-primary-container hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('newTicketBtn')}</span>
                </button>

                <Link
                  href="/support/tickets"
                  className="w-full h-11 bg-surface-container border border-outline-variant text-on-surface rounded-xl font-label-md text-sm font-semibold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:list-checks" className="w-4 h-4 text-primary" />
                  <span>{t('goToSupportTicketsBtn')}</span>
                </Link>
              </div>
            </div>
          )}

          {/* Direct Slack Contact Footer Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
              <Icon icon="lucide:slack" className="w-5 h-5" />
            </div>
            <p className="text-xs text-on-surface font-medium leading-normal">
              {t('contactDirect')}
            </p>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit FAQ */}
      <FaqModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editingFaq}
        onSave={handleSaveFaq}
      />

      {/* Delete Confirmation Alert Dialog */}
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

      {/* Animated Toast */}
      <div
        className={`fixed bottom-8 right-8 bg-inverse-surface dark:bg-surface-container-highest text-inverse-on-surface dark:text-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-500 z-50 border border-outline-variant/20 ${
          toastMsg ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95 pointer-events-none'
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="material-symbols-outlined text-emerald-500 text-2xl">check_circle</span>
        <p className="font-label-md text-sm font-bold">{toastMsg}</p>
      </div>
    </div>
  );
}

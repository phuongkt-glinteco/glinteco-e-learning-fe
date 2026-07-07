'use client';

import React, { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/default/accordion';

interface FaqItem {
  id: string;
  category: 'setup' | 'git' | 'grading' | 'account';
  titleKey: string;
  contentKey: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'setup',
    titleKey: 'faq1Title',
    contentKey: 'faq1Content',
  },
  {
    id: 'faq-2',
    category: 'account',
    titleKey: 'faq2Title',
    contentKey: 'faq2Content',
  },
  {
    id: 'faq-3',
    category: 'git',
    titleKey: 'faq3Title',
    contentKey: 'faq3Content',
  },
  {
    id: 'faq-4',
    category: 'grading',
    titleKey: 'faq4Title',
    contentKey: 'faq4Content',
  },
  {
    id: 'faq-5',
    category: 'account',
    titleKey: 'faq5Title',
    contentKey: 'faq5Content',
  },
];

export function SupportClient() {
  const t = useTranslations('SupportPage');
  
  // State cho lọc FAQ
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({});

  // State cho Form gửi yêu cầu hỗ trợ (Mock)
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastType, setToastType] = useState<'none' | 'success'>('none');

  // Lọc danh sách FAQ theo từ khóa và chủ đề
  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      const title = t(item.titleKey).toLowerCase();
      const content = t(item.contentKey).toLowerCase();
      return title.includes(query) || content.includes(query);
    });
  }, [selectedCategory, searchQuery, t]);

  const handleFeedback = (faqId: string, isHelpful: boolean) => {
    setHelpfulFeedback((prev) => ({ ...prev, [faqId]: isHelpful }));
  };

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    // Giả lập gửi API trong 1.2 giây
    setTimeout(() => {
      setIsSubmitting(false);
      setSubject('');
      setDescription('');
      setTopic('');
      setSeverity('normal');
      setToastType('success');
      setTimeout(() => {
        setToastType('none');
      }, 4000);
    }, 1200);
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
      {/* Header Banner */}
      <header className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/15 via-surface-container-low to-tertiary/10 p-6 sm:p-8 border border-outline-variant/30 shadow-sm">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 text-primary font-bold mb-3">
          <span className="p-1.5 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Icon icon="lucide:life-buoy" className="w-5 h-5 animate-spin-slow" />
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

      {/* Main Grid: FAQ (Left/7cols) vs Form (Right/5cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: FAQ Knowledge Base */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="font-heading text-xl sm:text-2xl font-bold flex items-center gap-2 text-on-surface">
              <Icon icon="lucide:book-open" className="w-6 h-6 text-primary" />
              {t('faqTitle')}
            </h2>
            <p className="text-sm text-on-surface-variant">{t('faqSubtitle')}</p>
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
          {filteredFaqs.length === 0 ? (
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
              {filteredFaqs.map((faq) => {
                const feedbackGiven = helpfulFeedback[faq.id] !== undefined;
                return (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-5 shadow-xs hover:border-primary/30 transition-colors overflow-hidden"
                  >
                    <AccordionTrigger className="text-base font-semibold text-on-surface hover:text-primary py-4">
                      <span className="text-left leading-snug">{t(faq.titleKey)}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-5 text-sm text-on-surface-variant leading-relaxed space-y-4 border-t border-outline-variant/20">
                      <p>{t(faq.contentKey)}</p>

                      {/* Helpful Feedback Footer for each FAQ */}
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

        {/* Right Column: Support & Feedback Form */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 sm:p-7 shadow-sm">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-outline-variant/20">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Icon icon="lucide:message-square-plus" className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-on-surface">{t('formTitle')}</h3>
                <p className="text-xs text-on-surface-variant">{t('formSubtitle')}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitSupport} className="space-y-4">
              {/* Topic Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {t('topicLabel')} <span className="text-error">*</span>
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="" disabled>{t('topicSelect')}</option>
                  <option value="setup">{t('topicSetup')}</option>
                  <option value="doc">{t('topicDoc')}</option>
                  <option value="access">{t('topicAccess')}</option>
                  <option value="other">{t('topicOther')}</option>
                </select>
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {t('subjectLabel')} <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t('subjectPlaceholder')}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>

              {/* Severity Toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {t('severityLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSeverity('normal')}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      severity === 'normal'
                        ? 'bg-surface-container border-primary text-primary shadow-xs'
                        : 'border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <Icon icon="lucide:smile" className="w-3.5 h-3.5" />
                    {t('sevNormal').split('(')[0].trim()}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSeverity('urgent')}
                    className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      severity === 'urgent'
                        ? 'bg-error/10 border-error text-error shadow-xs'
                        : 'border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <Icon icon="lucide:alert-triangle" className="w-3.5 h-3.5" />
                    {t('sevUrgent').split('(')[0].trim()}
                  </button>
                </div>
              </div>

              {/* Description Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {t('descLabel')} <span className="text-error">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('descPlaceholder')}
                  required
                  rows={4}
                  className="w-full p-3 rounded-lg border border-outline-variant bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-y min-h-[100px]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !subject.trim() || !description.trim() || !topic}
                className="w-full h-11 bg-primary text-on-primary rounded-xl font-label-md text-sm font-bold shadow-md hover:bg-primary-container hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="lucide:loader-2" className="w-4 h-4 animate-spin" />
                    <span>{t('submitting')}</span>
                  </>
                ) : (
                  <>
                    <Icon icon="lucide:send" className="w-4 h-4" />
                    <span>{t('submitBtn')}</span>
                  </>
                )}
              </button>
            </form>
          </div>

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

      {/* Animated Success Toast */}
      <div
        className={`fixed bottom-8 right-8 bg-inverse-surface dark:bg-surface-container-highest text-inverse-on-surface dark:text-on-surface px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 transition-all duration-500 z-50 border border-outline-variant/20 ${
          toastType !== 'none' ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-95 pointer-events-none'
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="material-symbols-outlined text-emerald-500 text-2xl">check_circle</span>
        <div>
          <p className="font-label-md text-sm font-bold">{t('toastTitle')}</p>
          <p className="font-body-sm text-xs opacity-80">{t('toastDesc')}</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/default/dialog';
import {
  Sparkles,
  BookOpen,
  Code2,
  HelpCircle,
  Layers,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { PuckViewer, useLessonPuckConfig, type LessonPuckData } from '@/components/puck-editor';
import { mockAiGenerateLesson } from '@/mocks/ai-service';

export type AiLessonType = 'reading' | 'practice' | 'quiz' | 'hybrid';

interface AILessonGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle?: string;
  initialDescription?: string;
  initialEstimatedTime?: string;
  onConfirmGenerate: (generatedData: LessonPuckData) => void;
}

export function AILessonGeneratorModal({
  open,
  onOpenChange,
  initialTitle = '',
  initialDescription = '',
  initialEstimatedTime = '20 mins',
  onConfirmGenerate,
}: AILessonGeneratorModalProps) {
  const t = useTranslations('PuckEditor.Lesson.aiModal');
  const lessonConfig = useLessonPuckConfig();

  const [step, setStep] = useState<'form' | 'loading' | 'preview' | 'error'>('form');
  const [selectedType, setSelectedType] = useState<AiLessonType>('reading');
  const [intent, setIntent] = useState('');
  const [title, setTitle] = useState(initialTitle);
  const [estimatedTime, setEstimatedTime] = useState(initialEstimatedTime);
  const [generatedData, setGeneratedData] = useState<LessonPuckData | null>(null);
  const [loadingText, setLoadingText] = useState(t('loadingStep1'));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep('form');
      setTitle(initialTitle || '');
      setEstimatedTime(initialEstimatedTime || '20 mins');
      setIntent('');
      setGeneratedData(null);
      setErrorMessage(null);
      setValidationError(null);
    }
  }, [open, initialTitle, initialEstimatedTime]);

  useEffect(() => {
    if (step !== 'loading') return;
    const messages = [
      t('loadingStep1'),
      t('loadingStep2'),
      t('loadingStep3'),
      t('loadingStep4'),
    ];
    let index = 0;
    setLoadingText(messages[0]);
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingText(messages[index]);
    }, 450);
    return () => clearInterval(interval);
  }, [step, t]);

  const handleStartGenerate = async () => {
    if (!intent.trim() && !title.trim()) {
      setValidationError(t('alertMissingInput'));
      return;
    }

    setValidationError(null);
    setStep('loading');
    setErrorMessage(null);
    try {
      const data = await mockAiGenerateLesson({
        title: title.trim() || intent.trim(),
        description: initialDescription || intent.trim(),
        estimatedTime: estimatedTime.trim() || '20 mins',
        type: selectedType,
        intent: intent.trim(),
      });
      setGeneratedData(data);
      setStep('preview');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('errorFallback');
      setErrorMessage(message);
      setStep('error');
    }
  };

  const handleConfirmUse = () => {
    if (generatedData) {
      onConfirmGenerate(generatedData);
      onOpenChange(false);
    }
  };

  const getProposedOutline = (type: AiLessonType) => {
    switch (type) {
      case 'reading':
        return [
          { block: 'CalloutBlock', label: t('outline.readingObj'), icon: '🎯' },
          { block: 'HeadingBlock', label: t('outline.readingH2'), icon: '📌' },
          { block: 'ParagraphBlock', label: t('outline.readingPara'), icon: '📝' },
          { block: 'ListBlock', label: t('outline.readingList'), icon: '📋' },
          { block: 'CodeBlock', label: t('outline.readingCode'), icon: '💻' },
          { block: 'TableBlock', label: t('outline.readingTable'), icon: '📊' },
          { block: 'CalloutBlock', label: t('outline.readingSummary'), icon: '💡' },
        ];
      case 'practice':
        return [
          { block: 'CalloutBlock', label: t('outline.practicePre'), icon: '⚠️' },
          { block: 'HeadingBlock', label: t('outline.practiceH1'), icon: '📌' },
          { block: 'CodeBlock', label: t('outline.practiceBash'), icon: '💻' },
          { block: 'HeadingBlock', label: t('outline.practiceH2'), icon: '📌' },
          { block: 'CodeBlock', label: t('outline.practiceCode'), icon: '💻' },
          { block: 'CalloutBlock', label: t('outline.practiceChallenge'), icon: '⚡' },
        ];
      case 'quiz':
        return [
          { block: 'CalloutBlock', label: t('outline.quizObj'), icon: '🎯' },
          { block: 'HeadingBlock', label: t('outline.quizH2'), icon: '📌' },
          { block: 'ParagraphBlock', label: t('outline.quizPara'), icon: '❓' },
          { block: 'CalloutBlock', label: t('outline.quizOptions'), icon: '📋' },
          { block: 'CalloutBlock', label: t('outline.quizAns'), icon: '💡' },
        ];
      case 'hybrid':
        return [
          { block: 'CalloutBlock', label: t('outline.hybridObj'), icon: '🎯' },
          { block: 'HeadingBlock', label: t('outline.hybridH1'), icon: '📌' },
          { block: 'ParagraphBlock', label: t('outline.hybridPara'), icon: '📝' },
          { block: 'ListBlock', label: t('outline.hybridList'), icon: '📋' },
          { block: 'TableBlock', label: t('outline.hybridTable'), icon: '📊' },
          { block: 'HeadingBlock', label: t('outline.hybridH2'), icon: '📌' },
          { block: 'CodeBlock', label: t('outline.hybridCode'), icon: '💻' },
          { block: 'CalloutBlock', label: t('outline.hybridSummary'), icon: '💡' },
        ];
    }
  };

  const lessonTypesList: Array<{
    id: AiLessonType;
    titleKey: string;
    descKey: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'reading',
      titleKey: t('types.readingTitle'),
      descKey: t('types.readingDesc'),
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'practice',
      titleKey: t('types.practiceTitle'),
      descKey: t('types.practiceDesc'),
      icon: <Code2 className="w-4 h-4" />,
    },
    {
      id: 'quiz',
      titleKey: t('types.quizTitle'),
      descKey: t('types.quizDesc'),
      icon: <HelpCircle className="w-4 h-4" />,
    },
    {
      id: 'hybrid',
      titleKey: t('types.hybridTitle'),
      descKey: t('types.hybridDesc'),
      icon: <Layers className="w-4 h-4" />,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[880px] max-h-[92vh] flex flex-col p-0 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-2xl text-on-surface overflow-hidden animate-fade-in">
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-outline-variant/30 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md flex-shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl sm:text-2xl font-extrabold text-on-surface">
                {t('title')}
              </DialogTitle>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {step === 'form' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <span>{t('step1Title')}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {lessonTypesList.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedType(item.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                          selectedType === item.id
                            ? 'bg-primary/10 border-primary shadow-xs ring-2 ring-primary/20'
                            : 'bg-surface-container-low border-outline-variant/60 hover:bg-surface-container'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="p-1.5 rounded-lg bg-primary/15 text-primary">
                            {item.icon}
                          </span>
                          {selectedType === item.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="font-bold text-xs text-on-surface">{item.titleKey}</div>
                        <div className="text-[11px] text-on-surface-variant line-clamp-2 leading-tight">
                          {item.descKey}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      <span>{t('lessonTitleLabel')}</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('lessonTitlePlaceholder')}
                      className="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      <span>{t('estimatedTimeLabel')}</span>
                    </label>
                    <input
                      type="text"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      placeholder={t('estimatedTimePlaceholder')}
                      className="w-full h-10 px-3 rounded-xl border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                    <span>{t('intentLabel')}</span>
                    <span className="text-[10px] font-normal text-primary">{t('intentHint')}</span>
                  </label>
                  <textarea
                    value={intent}
                    onChange={(e) => {
                      setIntent(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    rows={4}
                    placeholder={t('intentPlaceholder')}
                    className="w-full p-3.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-y leading-relaxed"
                  />
                  {validationError && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-error mt-1 p-2 rounded-lg bg-error/10 border border-error/20">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5 bg-surface-container/60 border border-outline-variant/50 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/30 text-xs font-bold text-primary uppercase tracking-wider">
                  <Layers className="w-4 h-4" />
                  <span>{t('proposedOutlineTitle')}</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {t('proposedOutlineDesc')}
                </p>

                <div className="space-y-2 pt-1">
                  {getProposedOutline(selectedType).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-2xs"
                    >
                      <span className="text-base flex-shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-on-surface leading-tight truncate">
                          {item.label}
                        </div>
                        <div className="font-mono text-[10px] text-on-surface-variant/70 leading-tight">
                          Block: {item.block}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-outline-variant/30 text-[11px] text-on-surface-variant italic">
                  {t('proposedOutlineTip')}
                </div>
              </div>
            </div>
          )}

          {step === 'loading' && (
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/15 animate-ping absolute inset-0" />
                <div className="w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg relative z-10">
                  <Sparkles className="w-10 h-10 animate-pulse" />
                </div>
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="font-heading text-lg font-bold text-on-surface">
                  {t('loadingTitle')}
                </h3>
                <p className="text-xs text-primary font-semibold animate-fade-in transition-all">
                  {loadingText}
                </p>
                <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-primary rounded-full animate-progress-indeterminate" />
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && generatedData && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-primary/10 border border-primary/30 text-primary">
                <div className="flex items-center gap-2.5 text-xs font-bold">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>{t('successCount', { count: generatedData.content.length })}</span>
                </div>
                <span className="text-[11px] font-medium bg-primary/20 px-2 py-0.5 rounded-full">
                  {t('successBadge')}
                </span>
              </div>

              <div className="border border-outline-variant/60 rounded-2xl bg-surface-container-lowest max-h-[500px] overflow-y-auto p-4 sm:p-6 shadow-inner space-y-6">
                <PuckViewer config={lessonConfig} data={generatedData} />
              </div>
            </div>
          )}

          {step === 'error' && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-error/15 text-error flex items-center justify-center shadow-xs">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-base font-bold text-on-surface">
                  {t('errorTitle')}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {errorMessage || t('errorFallback')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="px-5 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer flex items-center gap-2 mt-2 shadow-2xs"
              >
                <RefreshCw className="w-4 h-4 text-primary" />
                <span>{t('retryErrorBtn')}</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-outline-variant/30 bg-surface-container-lowest flex items-center justify-between gap-4 flex-wrap">
          {step === 'form' ? (
            <>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/60 text-xs font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
              >
                {t('cancelBtn')}
              </button>
              <button
                type="button"
                onClick={handleStartGenerate}
                disabled={!title.trim() && !intent.trim()}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('generateBtn')}</span>
              </button>
            </>
          ) : step === 'preview' ? (
            <>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer flex items-center gap-2 shadow-2xs"
              >
                <RefreshCw className="w-4 h-4 text-primary" />
                <span>{t('retryBtn')}</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmUse}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{t('prefillBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : step === 'loading' ? (
            <div className="w-full text-center text-xs text-on-surface-variant italic">
              {t('loadingKeepOpen')}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="ml-auto px-4 py-2.5 rounded-xl border border-outline-variant/60 text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              {t('closeBtn')}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  submissionsControllerFindAll,
  submissionsControllerReview,
  submissionsControllerFindHistory,
} from '@/services/api-client';
import type { SubmissionFeedItemDto, SubmissionHistoryItemDto } from '@/services/api-client';
import { UiShowError } from '@/services/errors';
import Avatar from '@/components/ui/Avatar';


const STATUS_BADGE: Record<string, string> = {
  submitted: 'bg-amber-100 text-amber-800',
  changes: 'bg-red-100 text-red-700',
  approved: 'bg-green-100 text-green-700',
};

function statusBadgeClass(status: string) {
  return STATUS_BADGE[status] ?? 'bg-surface-container text-secondary';
}

export default function ReviewQueuePage() {
  const t = useTranslations('ReviewQueuePage');
  const [submissions, setSubmissions] = useState<SubmissionFeedItemDto[]>([]);
  const [selected, setSelected] = useState<SubmissionFeedItemDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'changes' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<SubmissionHistoryItemDto[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'review' | 'history'>('review');

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await submissionsControllerFindAll({
        query: { status: 'submitted', limit: 50 },
        throwOnError: true,
      });
      const data = (res.data as { data?: SubmissionFeedItemDto[] })?.data ?? [];
      setSubmissions(data);
    } catch (e) {
      if (e instanceof UiShowError) {
        setError(e.errorCode);
      } else {
        setError('errorLoading');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const fetchHistory = useCallback(async (submissionId: string) => {
    setHistoryLoading(true);
    try {
      const res = await submissionsControllerFindHistory({
        path: { id: submissionId },
        throwOnError: true,
      });
      const data = (res.data as { history?: SubmissionHistoryItemDto[] })?.history ?? [];
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  function selectSubmission(sub: SubmissionFeedItemDto) {
    setSelected(sub);
    setActiveTab('review');
    setReviewNote('');
    setReviewError(null);
    fetchHistory(sub.id);
  }

  function openReview(action: 'approve' | 'changes') {
    setReviewAction(action);
    setReviewNote('');
    setReviewError(null);
    setShowReviewModal(true);
  }

  async function confirmReview() {
    if (!selected || !reviewAction) return;
    if (reviewAction === 'changes' && !reviewNote.trim()) {
      setReviewError('noteRequired');
      return;
    }
    setReviewing(true);
    setReviewError(null);
    try {
      await submissionsControllerReview({
        path: { id: selected.id },
        body: {
          status: reviewAction === 'approve' ? 'approved' : 'changes',
          comment: reviewNote.trim() || undefined,
        },
        throwOnError: true,
      });
      setSubmissions((prev) => prev.filter((s) => s.id !== selected.id));
      setShowReviewModal(false);
      setSelected(null);
      setHistory([]);
    } catch (e) {
      if (e instanceof UiShowError) {
        setReviewError(e.errorCode);
      } else {
        setReviewError(reviewAction === 'approve' ? 'errorApproving' : 'errorRequestingChanges');
      }
    } finally {
      setReviewing(false);
    }
  }

  function formatTime(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
  }

  function historyActionLabel(status: string): string {
    switch (status) {
      case 'submitted': return history.length > 0 && history[0].status === 'submitted' ? t('actionSubmitted') : t('actionResubmitted');
      case 'approved': return t('actionApproved');
      case 'changes': return t('actionChangesRequested');
      case 'rejected': return t('actionRejected');
      default: return status;
    }
  }

  return (
    <div className="px-gutter py-6 max-w-[1400px] mx-auto w-full h-full flex flex-col">
      <header className="mb-6">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">{t('title')}</h1>
        <p className="text-body-sm text-secondary">{t('subtitle')}</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-error text-[20px]">error</span>
          <p className="text-error text-body-sm font-medium flex-1">{t(error)}</p>
          <button onClick={fetchSubmissions} className="px-3 py-1.5 border border-error/30 text-error rounded-lg text-label-sm hover:bg-error/5 cursor-pointer">
            {t('retry')}
          </button>
        </div>
      )}

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        {/* Left: Submission List */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-outline-variant">
            <p className="text-label-sm text-secondary">
              {loading ? t('loading') : t('submissionsCount', { count: submissions.length })}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <span className="material-symbols-outlined animate-spin text-primary text-[24px]">sync</span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-outline">
                <span className="material-symbols-outlined text-[40px] mb-3">rate_review</span>
                <p className="text-label-sm">{t('noSubmissions')}</p>
              </div>
            ) : (
              submissions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => selectSubmission(sub)}
                  className={`w-full text-left p-4 hover:bg-surface-container-low transition-colors cursor-pointer ${
                    selected?.id === sub.id ? 'bg-primary-container/20 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={sub.user?.name ?? ''} hue={sub.user?.avatarHue} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="font-label-md text-on-surface truncate">{sub.user?.name ?? 'Unknown'}</p>
                      <p className="text-body-sm text-secondary truncate">
                        {sub.exercise && typeof sub.exercise === 'object' && 'title' in sub.exercise
                          ? (sub.exercise as { title: string }).title
                          : typeof sub.exercise === 'string'
                            ? sub.exercise
                            : ''}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${statusBadgeClass(sub.status)}`}>
                          {sub.status === 'submitted' ? t('submitted') : sub.status}
                        </span>
                        <span className="text-[10px] text-outline">{formatTime(sub.submittedAt)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          {!selected ? (
            <div className="flex flex-col items-center justify-center flex-1 text-outline">
              <span className="material-symbols-outlined text-[56px] mb-4">chevron_left</span>
              <p className="text-label-md">{t('selectSubmission')}</p>
            </div>
          ) : (
            <>
              {/* Detail Header */}
              <div className="p-6 border-b border-outline-variant">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar name={selected.user?.name ?? ''} hue={selected.user?.avatarHue} size={48} />
                    <div>
                      <p className="font-headline-sm text-on-surface">{selected.user?.name ?? 'Unknown'}</p>
                      <p className="text-body-sm text-secondary">
                        {selected.exercise && typeof selected.exercise === 'object' && 'title' in selected.exercise
                          ? (selected.exercise as { title: string }).title
                          : typeof selected.exercise === 'string'
                            ? selected.exercise
                            : ''}
                      </p>
                    </div>
                  </div>
                  <a
                    href={selected.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-primary/20 text-primary rounded-lg text-label-sm hover:bg-primary/5 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>PR</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-outline-variant px-6">
                <button
                  onClick={() => setActiveTab('review')}
                  className={`px-4 py-3 text-label-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'review' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-on-surface'
                  }`}
                >
                  {t('reviewActions')}
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-3 text-label-sm font-bold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-secondary hover:text-on-surface'
                  }`}
                >
                  {t('history')}
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'review' ? (
                  <div className="space-y-4">
                    <p className="text-body-sm text-secondary mb-4">
                      {t('submittedAt')}: {formatTime(selected.submittedAt)}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => openReview('approve')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg font-label-md hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        {t('approve')}
                      </button>
                      <button
                        onClick={() => openReview('changes')}
                        className="flex items-center gap-2 px-5 py-2.5 border border-warning text-warning rounded-lg font-label-md hover:bg-warning/5 transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">rate_review</span>
                        {t('requestChanges')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {historyLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <span className="material-symbols-outlined animate-spin text-primary text-[24px]">sync</span>
                      </div>
                    ) : history.length === 0 ? (
                      <div className="text-center py-8 text-outline">
                        <span className="material-symbols-outlined text-[32px] block mb-2">history</span>
                        <p className="text-label-sm">{t('historyEmpty')}</p>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-surface-container" />
                        <div className="space-y-6">
                          {history.map((item) => (
                            <div key={item.id} className="flex items-start gap-4 relative">
                              <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 z-10">
                                <span className="material-symbols-outlined text-[16px] text-secondary">
                                  {item.status === 'approved' ? 'check_circle' : item.status === 'changes' ? 'rate_review' : 'schedule'}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${statusBadgeClass(item.status)}`}>
                                    {historyActionLabel(item.status)}
                                  </span>
                                  <span className="text-[10px] text-outline">{formatTime(item.submittedAt)}</span>
                                </div>
                                {item.reviewNote && typeof item.reviewNote === 'string' && (
                                  <p className="text-body-sm text-on-surface-variant mt-1 bg-surface-container-low px-3 py-2 rounded-lg">
                                    {item.reviewNote}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Review Confirmation Modal */}
      {showReviewModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowReviewModal(false)}>
          <div className="bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="font-headline-sm text-on-surface mb-2">
                {reviewAction === 'approve' ? t('approve') : t('requestChanges')}
              </h3>
              <p className="text-body-sm text-secondary mb-4">
                {reviewAction === 'approve' ? t('approveConfirm') : t('requestChangesConfirm')}
              </p>

              {(reviewAction === 'changes' || reviewNote) && (
                <div className="mb-4">
                  <label className="block text-label-sm text-on-surface-variant mb-1.5">{t('reviewNoteLabel')}</label>
                  <textarea
                    className={`w-full border rounded-lg px-3 py-2 text-body-sm outline-none resize-none bg-surface-container-lowest ${
                      reviewError === 'noteRequired' ? 'border-error' : 'border-outline-variant focus:border-primary'
                    }`}
                    rows={4}
                    placeholder={t('reviewNotePlaceholder')}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    autoFocus={reviewAction === 'changes'}
                  />
                  {reviewError === 'noteRequired' && (
                    <p className="text-error text-[11px] mt-1">{t('noteRequired')}</p>
                  )}
                </div>
              )}

              {reviewError && reviewError !== 'noteRequired' && (
                <div className="mb-4 p-3 bg-error/10 border border-error rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[16px]">error</span>
                  <p className="text-error text-body-sm">{t(reviewError)}</p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-outline-variant text-secondary rounded-lg font-label-md hover:bg-surface-variant transition-colors cursor-pointer"
                  disabled={reviewing}
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={confirmReview}
                  disabled={reviewing}
                  className={`px-4 py-2 rounded-lg font-label-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                    reviewAction === 'approve'
                      ? 'bg-primary text-on-primary hover:opacity-90'
                      : 'bg-warning text-white hover:opacity-90'
                  }`}
                >
                  {reviewing && <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>}
                  {reviewAction === 'approve' ? t('approve') : t('requestChanges')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

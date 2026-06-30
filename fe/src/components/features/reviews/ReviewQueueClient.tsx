'use client';

import { useState, useCallback } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { submissionsControllerFindAll, submissionsControllerReview, submissionsControllerFindHistory } from '@/services/api-client';
import type { SubmissionFeedItemDto, SubmissionHistoryItemDto, SubmissionListResponseDto } from '@/services/api-client';
import { UiShowError } from '@/services/errors';
import { Button } from '@/components/ui/default/button';

import { SubmissionList } from './SubmissionList';
import { SubmissionDetail } from './SubmissionDetail';
import { ReviewModal } from './ReviewModal';

interface ReviewQueueClientProps {
  initialData: SubmissionFeedItemDto[];
  initialNextCursor: string | null;
  initialHasMore: boolean;
}

export default function ReviewQueueClient({ initialData, initialNextCursor, initialHasMore }: ReviewQueueClientProps) {
  const t = useTranslations('ReviewQueuePage');
  const format = useFormatter();

  const [submissions, setSubmissions] = useState<SubmissionFeedItemDto[]>(initialData);
  const [selected, setSelected] = useState<SubmissionFeedItemDto | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);

  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'changes' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<SubmissionHistoryItemDto[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchSubmissions = useCallback(async (cursor?: string | null, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await submissionsControllerFindAll({
        query: { 
          status: 'submitted', 
          limit: 20, 
          cursor: cursor || undefined 
        } as never,
        throwOnError: true,
      });
      const data = res.data as SubmissionListResponseDto;
      setSubmissions((prev) => (append ? [...prev, ...(data.data || [])] : (data.data || [])));
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor as unknown as string | null);
    } catch (e) {
      if (e instanceof UiShowError) {
        setError(e.errorCode);
      } else {
        setError('errorLoading');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  async function loadMore() {
    if (!hasMore || loadingMore) return;
    await fetchSubmissions(nextCursor, true);
  }

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

  function formatRelative(iso: string): string {
    try {
      return format.relativeTime(new Date(iso));
    } catch {
      return '';
    }
  }

  function getBadgeVariant(status: string) {
    switch (status) {
      case 'submitted': return 'default';
      case 'changes': return 'destructive';
      case 'approved': return 'success';
      default: return 'secondary';
    }
  }

  function historyActionLabel(status: string): string {
    switch (status) {
      case 'submitted': return history.length > 0 && history[history.length - 1]?.status === 'submitted' ? t('actionResubmitted') : t('actionSubmitted');
      case 'approved': return t('actionApproved');
      case 'changes': return t('actionChangesRequested');
      case 'rejected': return t('actionRejected');
      default: return t(status) || status;
    }
  }

  return (
    <div className="px-6 py-6 max-w-[1400px] mx-auto w-full h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-center gap-3">
          <span className="material-symbols-outlined text-destructive text-[20px]">error</span>
          <p className="text-destructive text-sm font-medium flex-1">{t(error)}</p>
          <Button variant="outline" size="sm" onClick={() => fetchSubmissions(null, false)} className="border-destructive/30 text-destructive hover:bg-destructive/10">
            {t('retry')}
          </Button>
        </div>
      )}

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <SubmissionList
          submissions={submissions}
          selectedId={selected?.id ?? null}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onSelect={selectSubmission}
          onLoadMore={loadMore}
          formatRelative={formatRelative}
          getBadgeVariant={getBadgeVariant}
        />

        <SubmissionDetail
          selected={selected}
          history={history}
          historyLoading={historyLoading}
          onOpenReview={openReview}
          formatRelative={formatRelative}
          historyActionLabel={historyActionLabel}
        />
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        onOpenChange={setShowReviewModal}
        action={reviewAction}
        note={reviewNote}
        onNoteChange={setReviewNote}
        error={reviewError}
        loading={reviewing}
        onConfirm={confirmReview}
        onCancel={() => setShowReviewModal(false)}
      />
    </div>
  );
}

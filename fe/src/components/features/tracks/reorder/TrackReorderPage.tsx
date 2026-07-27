'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTrackReorder } from '@/hooks/useTrackReorder';
import type { TrackSummaryDto } from '@/services/api-client';
import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';
import { AppButton } from '@/components/ui/buttons';
import { Icon } from '@iconify/react';
import ReorderTopBar from './ReorderTopBar';
import TrackBrowser from './TrackBrowser';
import SelectedTable from './SelectedTable';
import PositionPreview from './PositionPreview';
import ReorderControls from './ReorderControls';

interface TrackReorderPageProps {
  initialTracks?: TrackSummaryDto[];
}

export default function TrackReorderPage({ initialTracks }: TrackReorderPageProps) {
  const router = useRouter();
  const t = useTranslations('ReorderTracksPage');
  const {
    allTracks,
    selectedIds,
    selectedIds2,
    focusedGroup,
    setFocusedGroup,
    loading,
    error,
    saving,
    isDirty,
    isContiguous,
    previewOrder,
    sortMode,
    swapMode,
    toggleSelect,
    rangeSelect,
    ctrlToggleSelect,
    clearSelectionAll,
    moveBlockUp,
    moveBlockDown,
    moveBlockToStart,
    moveBlockToEnd,
    sortAZ,
    revertSelected,
    startSwap,
    cancelSwap,
    executeSwap,
    reorderAllTracks,
    reorderSelected,
    reorderSelected2,
    apply,
  } = useTrackReorder(initialTracks);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // We temporarily store block action to perform after warning dismiss
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const withWarning = useCallback(
    (action: () => void) => {
      const activeLength = swapMode ? selectedIds.length + selectedIds2.length : selectedIds.length;
      if (!isContiguous && activeLength > 1) {
        setPendingAction(() => action);
        return;
      }
      action();
    },
    [isContiguous, selectedIds.length, selectedIds2.length, swapMode],
  );

  const handleWarningConfirm = useCallback(() => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [pendingAction]);

  const handleWarningCancel = useCallback(() => {
    setPendingAction(null);
  }, []);

  const handleMoveUp = useCallback(() => withWarning(moveBlockUp), [withWarning, moveBlockUp]);
  const handleMoveDown = useCallback(() => withWarning(moveBlockDown), [withWarning, moveBlockDown]);
  const handleMoveStart = useCallback(() => withWarning(moveBlockToStart), [withWarning, moveBlockToStart]);
  const handleMoveEnd = useCallback(() => withWarning(moveBlockToEnd), [withWarning, moveBlockToEnd]);
  const handleRevert = useCallback(() => withWarning(revertSelected), [withWarning, revertSelected]);
  const handleExecuteSwap = useCallback(() => withWarning(executeSwap), [withWarning, executeSwap]);

  const handleApply = useCallback(async () => {
    setSubmitError(null);
    try {
      await apply();
      setShowConfirmModal(false);
    } catch {
      setSubmitError(t('applyError'));
    }
  }, [apply, t]);

  const handleBrowseReorder = useCallback(
    (ordered: TrackSummaryDto[]) => {
      reorderAllTracks(ordered);
    },
    [reorderAllTracks],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-md">
          <div className="w-10 h-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-body-sm text-on-surface-variant">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background gap-md">
        <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-error"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-body-sm text-on-surface-variant">{t('error')}</p>
      </div>
    );
  }

  const selectedCount = selectedIds.length + (swapMode ? selectedIds2.length : 0);
  const canMove = selectedIds.length > 0 && !swapMode;

  return (
    <div className="h-screen flex flex-col bg-background">
      <ReorderTopBar
        isDirty={isDirty}
        saving={saving}
        selectedCount={selectedCount}
        onBack={() => router.push('/admin/tracks')}
        onApply={() => setShowConfirmModal(true)}
        onCancel={() => router.push('/admin/tracks')}
      />

      <div className="flex flex-1 overflow-hidden">
        <TrackBrowser
          allTracks={allTracks}
          selectedIds={selectedIds}
          selectedIds2={selectedIds2}
          swapMode={swapMode}
          onToggle={toggleSelect}
          onRangeSelect={rangeSelect}
          onCtrlToggle={ctrlToggleSelect}
          onReorder={handleBrowseReorder}
        />

        <SelectedTable
          swapMode={swapMode}
          selectedIds1={selectedIds}
          selectedIds2={selectedIds2}
          focusedGroup={focusedGroup}
          allTracks={allTracks}
          onFocusGroup={setFocusedGroup}
          onRemove1={(id) => reorderSelected(selectedIds.filter((x) => x !== id))}
          onRemove2={(id) => reorderSelected2(selectedIds2.filter((x) => x !== id))}
          onReorder1={reorderSelected}
          onReorder2={reorderSelected2}
          onClear1={() => reorderSelected([])}
          onClear2={() => reorderSelected2([])}
        />

        <div className="w-[300px] flex flex-col border-l border-outline-variant bg-surface-container-lowest flex-shrink-0 h-full overflow-hidden">
          {/* Top Row: Preview + Vertical Move Sidebar */}
          <div className="flex flex-1 overflow-hidden min-h-0 w-full">
            <div className="flex-1 overflow-hidden flex flex-col h-full">
              <PositionPreview
                previewOrder={previewOrder}
                selectedIds={swapMode ? [...selectedIds, ...selectedIds2] : selectedIds}
              />
            </div>

            {/* Sidebar vertical controls */}
            {!swapMode && (
              <div className="w-11 border-l border-outline-variant/60 bg-surface-container-lowest flex flex-col items-center py-md gap-3 flex-shrink-0 justify-center">
                <button
                  onClick={handleMoveStart}
                  disabled={!canMove}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title={t('moveStart')}
                >
                  <Icon icon="lucide:chevrons-up" className="w-4 h-4" />
                </button>
                <button
                  onClick={handleMoveUp}
                  disabled={!canMove}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title={t('moveUp')}
                >
                  <Icon icon="lucide:arrow-up" className="w-4 h-4" />
                </button>
                <div className="h-px w-5 bg-outline-variant/40" />
                <button
                  onClick={handleMoveDown}
                  disabled={!canMove}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title={t('moveDown')}
                >
                  <Icon icon="lucide:arrow-down" className="w-4 h-4" />
                </button>
                <button
                  onClick={handleMoveEnd}
                  disabled={!canMove}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title={t('moveEnd')}
                >
                  <Icon icon="lucide:chevrons-down" className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <ReorderControls
            selectedIds={selectedIds}
            selectedIds2={selectedIds2}
            sortMode={sortMode}
            swapMode={swapMode}
            onStartSwap={startSwap}
            onCancelSwap={cancelSwap}
            onExecuteSwap={handleExecuteSwap}
            onSort={sortAZ}
            onRevert={handleRevert}
            onClear={clearSelectionAll}
          />
        </div>
      </div>

      {/* Warning dialog for gluing discontiguous selection */}
      <Modal open={!!pendingAction} onClose={handleWarningCancel} title={t('nonContiguousTitle')}>
        <div className="space-y-md">
          <p className="text-body-sm text-on-surface-variant">
            {t('nonContiguousBody')}
          </p>
          <div className="flex justify-end gap-md pt-md">
            <AppButton variant="outline" onClick={handleWarningCancel}>
              {t('no')}
            </AppButton>
            <AppButton onClick={handleWarningConfirm}>
              {t('yes')}
            </AppButton>
          </div>
        </div>
      </Modal>

      <Modal
        open={showConfirmModal}
        onClose={() => {
          if (!saving) setShowConfirmModal(false);
        }}
        title={t('confirmTitle')}
      >
        <div className="space-y-md">
          <p className="text-body-sm text-on-surface-variant">
            {t('confirmBody')}
          </p>
          {submitError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-error/10 text-error text-body-sm">
              <span>{submitError}</span>
            </div>
          )}
          <div className="flex justify-end gap-md pt-md">
            <AppButton
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              disabled={saving}
            >
              {t('cancel')}
            </AppButton>
            <AppButton onClick={handleApply} disabled={saving}>
              {saving ? t('saving') : t('confirmApply')}
            </AppButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}

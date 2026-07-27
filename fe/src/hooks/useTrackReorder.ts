'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { tracksControllerFindAll, tracksControllerReorder } from '@/services/client';
import type { TrackSummaryDto, TrackListResponseDto } from '@/services/client';
import {
  isSelectionContiguous,
  getPreviewOrder,
  moveBlock,
  swapBlocks,
  reorderSelectedInAllTracks,
  revertSelectedTracks,
} from '@/utils/reorder';

export interface UseTrackReorderResult {
  allTracks: TrackSummaryDto[];
  selectedIds: string[];
  selectedIds2: string[];
  focusedGroup: 1 | 2;
  setFocusedGroup: (group: 1 | 2) => void;
  lastClickedId: string | null;
  loading: boolean;
  error: string | null;
  saving: boolean;
  isDirty: boolean;
  isContiguous: boolean;
  isContiguous1: boolean;
  isContiguous2: boolean;
  previewOrder: TrackSummaryDto[];
  sortMode: boolean;
  swapMode: boolean;
  toggleSelect: (id: string) => void;
  rangeSelect: (id: string) => void;
  ctrlToggleSelect: (id: string) => void;
  clearSelection: () => void;
  clearSelectionAll: () => void;
  moveBlockUp: () => void;
  moveBlockDown: () => void;
  moveBlockToStart: () => void;
  moveBlockToEnd: () => void;
  sortAZ: () => void;
  revertSelected: () => void;
  startSwap: () => void;
  cancelSwap: () => void;
  executeSwap: () => void;
  reorderAllTracks: (ordered: TrackSummaryDto[]) => void;
  reorderSelected: (ids: string[]) => void;
  reorderSelected2: (ids: string[]) => void;
  apply: () => Promise<void>;
  selectedTracks: TrackSummaryDto[];
  selectedTracks2: TrackSummaryDto[];
}

export function useTrackReorder(initialTracks?: TrackSummaryDto[]): UseTrackReorderResult {
  const [allTracks, setAllTracks] = useState<TrackSummaryDto[]>(initialTracks ?? []);
  const [loading, setLoading] = useState(!initialTracks);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Group 1 selection (or normal selection)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Group 2 selection (for swap mode)
  const [selectedIds2, setSelectedIds2] = useState<string[]>([]);
  const [focusedGroup, setFocusedGroup] = useState<1 | 2>(1);

  const [originalOrder, setOriginalOrder] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState(false);
  const [swapMode, setSwapMode] = useState(false);
  const lastClickedIdRef = useRef<string | null>(null);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await tracksControllerFindAll({ query: { page: 1, limit: 100 }, throwOnError: true });
      const data = res.data as TrackListResponseDto;
      const sorted = [...data.data].sort((a, b) => a.order - b.order);
      setAllTracks(sorted);
    } catch {
      setError('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialTracks) fetchTracks();
  }, [initialTracks, fetchTracks]);

  useEffect(() => {
    if (allTracks.length > 0 && originalOrder.length === 0) {
      setOriginalOrder(allTracks.map((t) => t.id));
    }
  }, [allTracks, originalOrder.length]);

  const isDirty = useMemo(
    () => JSON.stringify(allTracks.map((t) => t.id)) !== JSON.stringify(originalOrder),
    [allTracks, originalOrder],
  );

  const isContiguous1 = useMemo(
    () => isSelectionContiguous(allTracks, selectedIds),
    [allTracks, selectedIds],
  );

  const isContiguous2 = useMemo(
    () => isSelectionContiguous(allTracks, selectedIds2),
    [allTracks, selectedIds2],
  );

  // Active contiguity: check both selections in swap mode, else check group 1
  const isContiguous = useMemo(
    () => (swapMode ? isContiguous1 && isContiguous2 : isContiguous1),
    [swapMode, isContiguous1, isContiguous2],
  );

  const previewOrder = useMemo(() => {
    if (!swapMode) {
      return getPreviewOrder(allTracks, selectedIds);
    } else {
      if (selectedIds2.length === 0) {
        return getPreviewOrder(allTracks, selectedIds);
      }
      return swapBlocks(allTracks, selectedIds, selectedIds2);
    }
  }, [allTracks, selectedIds, selectedIds2, swapMode]);

  const trackMap = useMemo(() => {
    const m = new Map<string, TrackSummaryDto>();
    for (const t of allTracks) m.set(t.id, t);
    return m;
  }, [allTracks]);

  const selectedTracks = useMemo(
    () => selectedIds.map((id) => trackMap.get(id)).filter(Boolean) as TrackSummaryDto[],
    [selectedIds, trackMap],
  );

  const selectedTracks2 = useMemo(
    () => selectedIds2.map((id) => trackMap.get(id)).filter(Boolean) as TrackSummaryDto[],
    [selectedIds2, trackMap],
  );

  const updateGroupSelection = useCallback(
    (id: string, modifier: 'toggle' | 'range' | 'ctrl') => {
      const group = swapMode ? focusedGroup : 1;
      const getNextList = (prev: string[]) => {
        if (modifier === 'toggle' || modifier === 'ctrl') {
          const idx = prev.indexOf(id);
          if (idx >= 0) return prev.filter((x) => x !== id);
          return [...prev, id];
        } else {
          // range select
          const last = lastClickedIdRef.current;
          if (!last) {
            return [id];
          }
          const lastIdx = allTracks.findIndex((t) => t.id === last);
          const currIdx = allTracks.findIndex((t) => t.id === id);
          if (lastIdx === -1 || currIdx === -1) return [id];
          const start = Math.min(lastIdx, currIdx);
          const end = Math.max(lastIdx, currIdx);
          return allTracks.slice(start, end + 1).map((t) => t.id);
        }
      };

      if (group === 1) {
        setSelectedIds((prev) => {
          const next = getNextList(prev);
          if (swapMode) {
            setSelectedIds2((p2) => p2.filter((x) => !next.includes(x)));
          }
          return next;
        });
      } else {
        setSelectedIds2((prev) => {
          const next = getNextList(prev);
          setSelectedIds((p1) => p1.filter((x) => !next.includes(x)));
          return next;
        });
      }
      setSortMode(false);
      lastClickedIdRef.current = id;
    },
    [swapMode, focusedGroup, allTracks],
  );

  const toggleSelect = useCallback((id: string) => updateGroupSelection(id, 'toggle'), [updateGroupSelection]);
  const rangeSelect = useCallback((id: string) => updateGroupSelection(id, 'range'), [updateGroupSelection]);
  const ctrlToggleSelect = useCallback((id: string) => updateGroupSelection(id, 'ctrl'), [updateGroupSelection]);

  const clearSelection = useCallback(() => {
    if (swapMode) {
      if (focusedGroup === 1) {
        setSelectedIds([]);
      } else {
        setSelectedIds2([]);
      }
    } else {
      setSelectedIds([]);
      setSelectedIds2([]);
    }
    setSortMode(false);
    lastClickedIdRef.current = null;
  }, [swapMode, focusedGroup]);

  const clearSelectionAll = useCallback(() => {
    setSelectedIds([]);
    setSelectedIds2([]);
    setSwapMode(false);
    setFocusedGroup(1);
    setSortMode(false);
    lastClickedIdRef.current = null;
  }, []);

  const performMoveAction = useCallback(
    (direction: 'up' | 'down' | 'start' | 'end') => {
      const activeIds = swapMode && focusedGroup === 2 ? selectedIds2 : selectedIds;
      if (activeIds.length === 0) return;

      setAllTracks((prev) => moveBlock(prev, activeIds, direction));
      setSortMode(false);
    },
    [selectedIds, selectedIds2, swapMode, focusedGroup],
  );

  const moveBlockUp = useCallback(() => performMoveAction('up'), [performMoveAction]);
  const moveBlockDown = useCallback(() => performMoveAction('down'), [performMoveAction]);
  const moveBlockToStart = useCallback(() => performMoveAction('start'), [performMoveAction]);
  const moveBlockToEnd = useCallback(() => performMoveAction('end'), [performMoveAction]);

  const startSwap = useCallback(() => {
    if (selectedIds.length === 0) return;
    setSwapMode(true);
    setSelectedIds2([]);
    setFocusedGroup(2);
  }, [selectedIds]);

  const cancelSwap = useCallback(() => {
    setSwapMode(false);
    setSelectedIds2([]);
    setFocusedGroup(1);
  }, []);

  const executeSwap = useCallback(() => {
    if (selectedIds.length === 0 || selectedIds2.length === 0) return;
    setAllTracks((prev) => swapBlocks(prev, selectedIds, selectedIds2));
    setSwapMode(false);
    setSelectedIds2([]);
    setFocusedGroup(1);
  }, [selectedIds, selectedIds2]);

  const sortAZ = useCallback(() => {
    const activeIds = swapMode && focusedGroup === 2 ? selectedIds2 : selectedIds;
    if (activeIds.length < 2) return;

    const sortedIds = [...activeIds].sort((a, b) => {
      const ta = trackMap.get(a);
      const tb = trackMap.get(b);
      const keyA = ta?.title ?? '';
      const keyB = tb?.title ?? '';
      return keyA.localeCompare(keyB);
    });

    if (swapMode && focusedGroup === 2) {
      setSelectedIds2(sortedIds);
      setAllTracks((prev) => reorderSelectedInAllTracks(prev, sortedIds));
    } else {
      setSelectedIds(sortedIds);
      setAllTracks((prev) => reorderSelectedInAllTracks(prev, sortedIds));
    }
    setSortMode(true);
  }, [selectedIds, selectedIds2, swapMode, focusedGroup, trackMap]);

  const revertSelected = useCallback(() => {
    const activeIds = swapMode && focusedGroup === 2 ? selectedIds2 : selectedIds;
    if (activeIds.length === 0) return;

    const { nextTracks, nextSelectedIds } = revertSelectedTracks(allTracks, activeIds, originalOrder);
    setAllTracks(nextTracks);
    if (swapMode && focusedGroup === 2) {
      setSelectedIds2(nextSelectedIds);
    } else {
      setSelectedIds(nextSelectedIds);
    }
    setSortMode(false);
  }, [allTracks, selectedIds, selectedIds2, swapMode, focusedGroup, originalOrder]);

  const reorderAllTracks = useCallback((ordered: TrackSummaryDto[]) => {
    setAllTracks(ordered);
  }, []);

  const reorderSelected = useCallback((ids: string[]) => {
    setSelectedIds(ids);
    setAllTracks((prev) => reorderSelectedInAllTracks(prev, ids));
    setSortMode(false);
  }, []);

  const reorderSelected2 = useCallback((ids: string[]) => {
    setSelectedIds2(ids);
    setAllTracks((prev) => reorderSelectedInAllTracks(prev, ids));
    setSortMode(false);
  }, []);

  const apply = useCallback(async () => {
    setSaving(true);
    try {
      const order = allTracks.map((t) => t.id);
      await tracksControllerReorder({ body: { order }, throwOnError: true });
      setOriginalOrder(order);
      await fetchTracks();
    } catch {
      throw new Error('Failed to reorder tracks');
    } finally {
      setSaving(false);
    }
  }, [allTracks, fetchTracks]);

  return {
    allTracks,
    selectedIds,
    selectedIds2,
    focusedGroup,
    setFocusedGroup,
    lastClickedId: lastClickedIdRef.current,
    loading,
    error,
    saving,
    isDirty,
    isContiguous,
    isContiguous1,
    isContiguous2,
    previewOrder,
    sortMode,
    swapMode,
    toggleSelect,
    rangeSelect,
    ctrlToggleSelect,
    clearSelection,
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
    selectedTracks,
    selectedTracks2,
  };
}

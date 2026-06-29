export function isSelectionContiguous<T extends { id: string }>(
  allTracks: T[],
  selectedIds: string[]
): boolean {
  if (selectedIds.length <= 1) return true;
  const indices = selectedIds.map((id) => allTracks.findIndex((t) => t.id === id));
  const sortedIndices = [...indices].sort((a, b) => a - b);
  for (let i = 1; i < sortedIndices.length; i++) {
    if (sortedIndices[i] !== sortedIndices[i - 1] + 1) return false;
  }
  return true;
}

export function getPreviewOrder<T extends { id: string }>(
  allTracks: T[],
  selectedIds: string[]
): T[] {
  if (selectedIds.length === 0) return allTracks;
  const selectedSet = new Set(selectedIds);
  const firstIdx = allTracks.findIndex((t) => selectedSet.has(t.id));
  if (firstIdx === -1) return allTracks;

  const unselected = allTracks.filter((t) => !selectedSet.has(t.id));

  const trackMap = new Map<string, T>();
  for (const t of allTracks) {
    if (selectedSet.has(t.id)) {
      trackMap.set(t.id, t);
    }
  }
  const selectedBlock = selectedIds
    .map((id) => trackMap.get(id))
    .filter((t): t is T => !!t);

  const result = [...unselected];
  result.splice(firstIdx, 0, ...selectedBlock);
  return result;
}

export function moveBlock<T extends { id: string }>(
  allTracks: T[],
  selectedIds: string[],
  direction: 'up' | 'down' | 'start' | 'end'
): T[] {
  if (selectedIds.length === 0) return allTracks;
  const selectedSet = new Set(selectedIds);
  const firstIdx = allTracks.findIndex((t) => selectedSet.has(t.id));
  if (firstIdx === -1) return allTracks;

  const unselected = allTracks.filter((t) => !selectedSet.has(t.id));

  let unselectedBefore = 0;
  for (let i = 0; i < firstIdx; i++) {
    if (!selectedSet.has(allTracks[i].id)) {
      unselectedBefore++;
    }
  }

  let newInsertIdx = unselectedBefore;
  if (direction === 'start') {
    newInsertIdx = 0;
  } else if (direction === 'end') {
    newInsertIdx = unselected.length;
  } else if (direction === 'up') {
    newInsertIdx = Math.max(0, unselectedBefore - 1);
  } else if (direction === 'down') {
    newInsertIdx = Math.min(unselected.length, unselectedBefore + 1);
  }

  const trackMap = new Map<string, T>();
  for (const t of allTracks) {
    if (selectedSet.has(t.id)) {
      trackMap.set(t.id, t);
    }
  }
  const selectedBlock = selectedIds
    .map((id) => trackMap.get(id))
    .filter((t): t is T => !!t);

  const result = [...unselected];
  result.splice(newInsertIdx, 0, ...selectedBlock);
  return result;
}

export function swapBlocks<T extends { id: string }>(
  allTracks: T[],
  selectedIds1: string[],
  selectedIds2: string[]
): T[] {
  if (selectedIds1.length === 0 || selectedIds2.length === 0) return allTracks;

  const set1 = new Set(selectedIds1);
  const set2 = new Set(selectedIds2);

  const firstIdx1 = allTracks.findIndex((t) => set1.has(t.id));
  const firstIdx2 = allTracks.findIndex((t) => set2.has(t.id));

  if (firstIdx1 === -1 || firstIdx2 === -1) return allTracks;

  const unselected = allTracks.filter((t) => !set1.has(t.id) && !set2.has(t.id));

  let unselectedBefore1 = 0;
  let unselectedBefore2 = 0;
  for (let i = 0; i < firstIdx1; i++) {
    if (!set1.has(allTracks[i].id) && !set2.has(allTracks[i].id)) {
      unselectedBefore1++;
    }
  }
  for (let i = 0; i < firstIdx2; i++) {
    if (!set1.has(allTracks[i].id) && !set2.has(allTracks[i].id)) {
      unselectedBefore2++;
    }
  }

  const trackMap = new Map<string, T>();
  for (const t of allTracks) {
    trackMap.set(t.id, t);
  }

  const block1 = selectedIds1
    .map((id) => trackMap.get(id))
    .filter((t): t is T => !!t);
  const block2 = selectedIds2
    .map((id) => trackMap.get(id))
    .filter((t): t is T => !!t);

  const result = [...unselected];

  if (unselectedBefore1 <= unselectedBefore2) {
    result.splice(unselectedBefore1, 0, ...block2);
    result.splice(unselectedBefore2 + block2.length, 0, ...block1);
  } else {
    result.splice(unselectedBefore2, 0, ...block1);
    result.splice(unselectedBefore1 + block1.length, 0, ...block2);
  }

  return result;
}

export function reorderSelectedInAllTracks<T extends { id: string }>(
  allTracks: T[],
  selectedIds: string[]
): T[] {
  if (selectedIds.length === 0) return allTracks;
  const selectedSet = new Set(selectedIds);

  const indices: number[] = [];
  allTracks.forEach((t, idx) => {
    if (selectedSet.has(t.id)) {
      indices.push(idx);
    }
  });

  const trackMap = new Map<string, T>();
  for (const t of allTracks) {
    trackMap.set(t.id, t);
  }

  const nextTracks = [...allTracks];
  selectedIds.forEach((id, i) => {
    const track = trackMap.get(id);
    if (track && i < indices.length) {
      nextTracks[indices[i]] = track;
    }
  });

  return nextTracks;
}

export function revertSelectedTracks<T extends { id: string }>(
  allTracks: T[],
  selectedIds: string[],
  originalOrder: string[]
): { nextTracks: T[]; nextSelectedIds: string[] } {
  if (selectedIds.length === 0) return { nextTracks: allTracks, nextSelectedIds: selectedIds };

  const selectedSet = new Set(selectedIds);
  const firstIdx = allTracks.findIndex((t) => selectedSet.has(t.id));
  if (firstIdx === -1) return { nextTracks: allTracks, nextSelectedIds: selectedIds };

  const nextSelectedIds = [...selectedIds].sort((a, b) => {
    return originalOrder.indexOf(a) - originalOrder.indexOf(b);
  });

  const unselected = allTracks.filter((t) => !selectedSet.has(t.id));

  let unselectedBefore = 0;
  for (let i = 0; i < firstIdx; i++) {
    if (!selectedSet.has(allTracks[i].id)) {
      unselectedBefore++;
    }
  }

  const trackMap = new Map<string, T>();
  for (const t of allTracks) {
    if (selectedSet.has(t.id)) {
      trackMap.set(t.id, t);
    }
  }
  const sortedSelectedBlock = nextSelectedIds
    .map((id) => trackMap.get(id))
    .filter((t): t is T => !!t);

  const nextTracks = [...unselected];
  nextTracks.splice(unselectedBefore, 0, ...sortedSelectedBlock);

  return { nextTracks, nextSelectedIds };
}


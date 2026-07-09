import type { CanvasBlock } from '../types';

/**
 * Recursively updates a block by ID in a CanvasBlock tree.
 */
export function updateBlockRecursive(
  list: CanvasBlock[],
  blockId: string,
  updater: (block: CanvasBlock) => CanvasBlock
): CanvasBlock[] {
  return list.map((item) => {
    if (item.id === blockId) {
      return updater(item);
    }
    if (item.children && item.children.length > 0) {
      return { ...item, children: updateBlockRecursive(item.children, blockId, updater) };
    }
    return item;
  });
}

/**
 * Recursively appends a child block inside a container by containerId.
 */
export function appendChildToContainerRecursive(
  list: CanvasBlock[],
  containerId: string,
  newChild: CanvasBlock
): CanvasBlock[] {
  return list.map((item) => {
    if (item.id === containerId) {
      return {
        ...item,
        children: [...(item.children || []), newChild],
      };
    }
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: appendChildToContainerRecursive(item.children, containerId, newChild),
      };
    }
    return item;
  });
}

/**
 * Recursively updates a child block inside a specific container.
 */
export function updateChildInContainerRecursive(
  list: CanvasBlock[],
  containerId: string,
  childId: string,
  updatedChild: CanvasBlock
): CanvasBlock[] {
  return list.map((item) => {
    if (item.id === containerId) {
      return {
        ...item,
        children: (item.children || []).map((ch) =>
          ch.id === childId ? updatedChild : ch
        ),
      };
    }
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: updateChildInContainerRecursive(item.children, containerId, childId, updatedChild),
      };
    }
    return item;
  });
}

/**
 * Recursively deletes a child block from a specific container.
 */
export function deleteChildFromContainerRecursive(
  list: CanvasBlock[],
  containerId: string,
  childId: string
): CanvasBlock[] {
  return list.map((item) => {
    if (item.id === containerId) {
      return {
        ...item,
        children: (item.children || []).filter((ch) => ch.id !== childId),
      };
    }
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: deleteChildFromContainerRecursive(item.children, containerId, childId),
      };
    }
    return item;
  });
}

/**
 * Recursively inserts a child block immediately after afterChildId inside containerId.
 */
export function insertChildAfterRecursive(
  list: CanvasBlock[],
  containerId: string,
  afterChildId: string,
  newChild: CanvasBlock
): CanvasBlock[] {
  return list.map((item) => {
    if (item.id === containerId) {
      const chs = item.children || [];
      const idx = chs.findIndex((c) => c.id === afterChildId);
      if (idx === -1) return item;
      const nextChs = [...chs];
      nextChs.splice(idx + 1, 0, newChild);
      return {
        ...item,
        children: nextChs,
      };
    }
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: insertChildAfterRecursive(item.children, containerId, afterChildId, newChild),
      };
    }
    return item;
  });
}

/**
 * Recursively moves a child block up or down inside containerId.
 */
export function moveChildBlockRecursive(
  list: CanvasBlock[],
  containerId: string,
  childIdx: number,
  direction: 'up' | 'down'
): CanvasBlock[] {
  return list.map((item) => {
    if (item.id === containerId) {
      const newChildren = [...(item.children || [])];
      if (direction === 'up') {
        if (childIdx <= 0 || childIdx >= newChildren.length) return item;
        const temp = newChildren[childIdx - 1];
        newChildren[childIdx - 1] = newChildren[childIdx];
        newChildren[childIdx] = temp;
      } else {
        if (childIdx < 0 || childIdx >= newChildren.length - 1) return item;
        const temp = newChildren[childIdx + 1];
        newChildren[childIdx + 1] = newChildren[childIdx];
        newChildren[childIdx] = temp;
      }
      return {
        ...item,
        children: newChildren,
      };
    }
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: moveChildBlockRecursive(item.children, containerId, childIdx, direction),
      };
    }
    return item;
  });
}

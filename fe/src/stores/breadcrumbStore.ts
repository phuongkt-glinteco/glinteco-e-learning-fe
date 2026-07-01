import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BreadcrumbNode {
  label: string;
  href: string;
}

interface BreadcrumbState {
  tree: BreadcrumbNode[];
  pushNode: (node: BreadcrumbNode) => void;
  popNode: () => void;
  setTree: (tree: BreadcrumbNode[]) => void;
  getBackHref: (fallback?: string) => string | undefined;
}

export const useBreadcrumbStore = create<BreadcrumbState>()(
  persist(
    (set, get) => ({
      tree: [],
      pushNode: (node) => set((state) => {
        // If node already exists, truncate up to it and update label (handling back navigation & translation changes)
        const index = state.tree.findIndex(n => n.href === node.href);
        if (index !== -1) {
          const newTree = state.tree.slice(0, index + 1);
          newTree[index] = { ...newTree[index], label: node.label };
          return { tree: newTree };
        }
        return { tree: [...state.tree, node] };
      }),
      popNode: () => set((state) => ({ tree: state.tree.slice(0, -1) })),
      setTree: (tree) => set({ tree }),
      getBackHref: (fallback) => {
        const state = get();
        if (state.tree.length > 1) {
          return state.tree[state.tree.length - 2].href;
        }
        return fallback;
      }
    }),
    { name: 'glinteco-breadcrumbs' }
  )
);

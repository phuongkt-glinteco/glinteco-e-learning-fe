'use client';

import { useState, useEffect, useCallback } from 'react';
import { documentsControllerFindAll, documentsControllerFindAllTags } from '@/services/api-client';
import type { DocumentResponseDto, TagResponseDto } from '@/services/api-client';

interface ResourceDocumentPickerDialogProps {
  open: boolean;
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (ids: string[], documents?: DocumentResponseDto[]) => void;
}

export default function ResourceDocumentPickerDialog({
  open,
  selectedIds,
  onClose,
  onConfirm,
}: ResourceDocumentPickerDialogProps) {
  const [documents, setDocuments] = useState<DocumentResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<TagResponseDto[]>([]);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));

  useEffect(() => {
    if (open) {
      setSelected(new Set(selectedIds));
    }
  }, [open, selectedIds]);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await documentsControllerFindAll({
        query: {
          q: search || undefined,
          kind: (kindFilter as DocumentResponseDto['kind']) || undefined,
          tags: tagFilter || undefined,
          limit: 50,
        },
        throwOnError: true,
      });
      setDocuments(res.data?.data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, kindFilter, tagFilter]);

  useEffect(() => {
    if (open) fetchDocs();
  }, [open, fetchDocs]);

  useEffect(() => {
    if (!open) return;
    documentsControllerFindAllTags({ throwOnError: true })
      .then((res) => setTags((res.data as TagResponseDto[] | undefined) ?? []))
      .catch(() => setTags([]));
  }, [open]);

  function toggleDoc(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    const ids = Array.from(selected);
    onConfirm(ids, documents.filter((doc) => doc.id && selected.has(doc.id)));
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-2xl rounded-xl shadow-xl overflow-hidden border border-outline-variant">
        {/* Header */}
        <div className="px-lg py-md border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <h3 className="font-headline-sm text-on-surface">Add Resource Document</h3>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-on-surface-variant hover:text-on-surface cursor-pointer"
          >
            close
          </button>
        </div>

        {/* Body */}
        <div className="p-lg space-y-lg">
          {/* Search */}
          <div className="flex gap-md">
            <div className="flex-1 flex items-center gap-sm border border-outline-variant rounded-lg px-md py-2 bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
              <input
                className="flex-1 border-none focus:ring-0 text-body-base outline-none bg-transparent"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="text-label-sm text-on-surface-variant">Kind</label>
              <select
                className="w-full border border-outline-variant rounded-lg p-sm text-body-base bg-surface-container-lowest outline-none focus:border-primary"
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Guide">Guide</option>
                <option value="Reference">Reference</option>
                <option value="Runbook">Runbook</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Link">Link</option>
              </select>
            </div>
            <div className="space-y-xs">
              <label className="text-label-sm text-on-surface-variant">Tag</label>
              <select
                className="w-full border border-outline-variant rounded-lg p-sm text-body-base bg-surface-container-lowest outline-none focus:border-primary"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Document List */}
          <div className="border border-outline-variant rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto bg-surface-container-lowest">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-outline">
                  <span className="material-symbols-outlined animate-spin mr-2">refresh</span>
                  Loading...
                </div>
              ) : documents.length === 0 ? (
                <div className="py-12 text-center text-outline font-label-sm">
                  No documents found.
                </div>
              ) : (
                documents.map((doc) => {
                  const checked = selected.has(doc.id!);
                  return (
                    <label
                      key={doc.id}
                      className="flex items-center gap-md px-md py-3 border-b border-outline-variant last:border-b-0 hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDoc(doc.id!)}
                        className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="material-symbols-outlined text-primary text-[20px]">description</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-body-md text-on-surface truncate">{doc.title}</p>
                        <p className="text-label-sm text-on-surface-variant">
                          {doc.tags?.map((t) => t.name).join(', ') || 'Untagged'} &middot; {doc.kind || 'Unknown'}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Documents */}
          <div className="space-y-sm">
            <div className="flex justify-between items-center">
              <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                Selected Documents ({selected.size})
              </label>
              {selected.size > 0 && (
                <button
                  onClick={() => setSelected(new Set())}
                  className="text-label-sm text-primary hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="max-h-[100px] overflow-y-auto flex flex-wrap gap-sm p-sm bg-surface-container-low rounded-lg border border-outline-variant min-h-[44px]">
              {selected.size === 0 ? (
                <span className="text-label-sm text-outline">No documents selected</span>
              ) : (
                documents
                  .filter((d) => selected.has(d.id!))
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-xs bg-white border border-primary/20 px-sm py-xs rounded-full"
                    >
                      <span className="text-label-sm text-on-surface truncate max-w-[160px]">{doc.title}</span>
                      <button
                        onClick={() => toggleDoc(doc.id!)}
                        className="material-symbols-outlined text-[16px] text-on-surface-variant hover:text-error cursor-pointer"
                      >
                        close
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-lg py-md border-t border-outline-variant flex justify-end gap-md bg-surface-container-lowest">
          <button
            onClick={onClose}
            className="px-lg py-sm font-label-md text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-lg py-sm bg-primary text-on-primary rounded-lg font-label-md hover:brightness-110 transition-all shadow-md cursor-pointer"
          >
            Add {selected.size} Selected Document{selected.size !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

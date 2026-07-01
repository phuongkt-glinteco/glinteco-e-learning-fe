'use client';

import { useState, useEffect, useCallback } from 'react';
import { documentsControllerFindAll, documentsControllerFindAllTags } from '@/services/api-client';
import type { DocumentResponseDto, TagResponseDto } from '@/services/api-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/default/dialog';
import { Button } from '@/components/ui/default/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/default/select';
import { Checkbox } from '@/components/ui/default/checkbox';
import { Label } from '@/components/ui/default/label';

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

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Add Resource Document</DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Search */}
          <div className="flex gap-md">
            <div className="flex-1 flex items-center gap-2 border rounded-md px-3 h-10 focus-within:ring-1 focus-within:ring-ring">
              <span className="material-symbols-outlined text-muted-foreground text-[20px]">search</span>
              <input
                className="flex h-full w-full bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground block">Kind</Label>
              <Select value={kindFilter || 'all'} onValueChange={(v) => setKindFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Guide">Guide</SelectItem>
                  <SelectItem value="Reference">Reference</SelectItem>
                  <SelectItem value="Runbook">Runbook</SelectItem>
                  <SelectItem value="Tutorial">Tutorial</SelectItem>
                  <SelectItem value="Link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground block">Tag</Label>
              <Select value={tagFilter || 'all'} onValueChange={(v) => setTagFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id!}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleDoc(doc.id!)}
                        className="mr-2"
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
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Selected Documents ({selected.size})
              </Label>
              {selected.size > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSelected(new Set())}
                  className="h-auto p-0 text-primary"
                >
                  Clear All
                </Button>
              )}
            </div>
            <div className="max-h-[100px] overflow-y-auto flex flex-wrap gap-2 p-2 bg-secondary/20 rounded-lg border border-border min-h-[44px]">
              {selected.size === 0 ? (
                <span className="text-sm text-muted-foreground">No documents selected</span>
              ) : (
                documents
                  .filter((d) => selected.has(d.id!))
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-1 bg-background border border-primary/20 px-2 py-1 rounded-full"
                    >
                      <span className="text-xs text-foreground truncate max-w-[160px]">{doc.title}</span>
                      <button
                        onClick={() => toggleDoc(doc.id!)}
                        className="material-symbols-outlined text-[14px] text-muted-foreground hover:text-destructive cursor-pointer"
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
        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Add {selected.size} Selected Document{selected.size !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

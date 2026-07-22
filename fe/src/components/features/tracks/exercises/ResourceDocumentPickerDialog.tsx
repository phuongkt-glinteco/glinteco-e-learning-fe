'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { documentsControllerFindAll, documentsControllerFindAllTags } from '@/services/api-client';
import type { DocumentResponseDto } from '@/services/api-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/default/dialog';
import { Button } from '@/components/ui/default/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/default/select';
import { Checkbox } from '@/components/ui/default/checkbox';
import { Label } from '@/components/ui/default/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/default/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/default/command';
import { Badge } from '@/components/ui/default/badge';

interface ResourceDocumentPickerDialogProps {
  open: boolean;
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (ids: string[], documents?: DocumentResponseDto[]) => void;
}

function normalizeTags(tags: unknown): { id: string; name: string }[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t: Record<string, unknown>) => ({
      id: String(t?.id ?? '').trim(),
      name: String(t?.name ?? '').trim(),
    }))
    .filter((t) => Boolean(t.id && t.name));
}

export default function ResourceDocumentPickerDialog({
  open,
  selectedIds,
  onClose,
  onConfirm,
}: ResourceDocumentPickerDialogProps) {
  const t = useTranslations('ResourceDocumentPickerDialog');
  const kindMap: Record<string, string> = {
    Guide: t('guide'),
    Reference: t('reference'),
    Runbook: t('runbook'),
    Tutorial: t('tutorial'),
    Link: t('link'),
  };

  const [documents, setDocuments] = useState<DocumentResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('');
  const [selectedTagsFilter, setSelectedTagsFilter] = useState<string[]>([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedIds));
  const [knownDocs, setKnownDocs] = useState<Record<string, DocumentResponseDto>>({});

  useEffect(() => {
    if (open) {
      setSelected(new Set(selectedIds));
    }
  }, [open, selectedIds]);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const tagsQuery = selectedTagsFilter.length > 0 ? selectedTagsFilter.join(',') : undefined;
      const res = await documentsControllerFindAll({
        query: {
          q: search || undefined,
          kind: (kindFilter as DocumentResponseDto['kind']) || undefined,
          tags: tagsQuery,
          limit: 50,
        },
        throwOnError: true,
      });
      const docsList = res.data?.data ?? [];
      setDocuments(docsList);
      setKnownDocs((prev) => {
        const next = { ...prev };
        docsList.forEach((d) => {
          if (d && d.id) next[d.id] = d;
        });
        return next;
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, kindFilter, selectedTagsFilter]);

  useEffect(() => {
    if (open) fetchDocs();
  }, [open, fetchDocs]);

  useEffect(() => {
    if (!open) return;
    documentsControllerFindAllTags({ throwOnError: true })
      .then((res) => setTags(normalizeTags(res.data)))
      .catch(() => setTags([]));
  }, [open]);

  function toggleDoc(docOrId: DocumentResponseDto | string) {
    const id = typeof docOrId === 'string' ? docOrId : docOrId.id;
    if (!id) return;
    if (typeof docOrId !== 'string') {
      setKnownDocs((prev) => ({ ...prev, [id]: docOrId }));
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleTagFilter(tagName: string) {
    setSelectedTagsFilter((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  }

  function handleConfirm() {
    const ids = Array.from(selected);
    const selectedDocsList = ids
      .map((id) => knownDocs[id] || documents.find((doc) => doc.id === id))
      .filter((doc): doc is DocumentResponseDto => Boolean(doc));
    onConfirm(ids, selectedDocsList);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-3xl max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden bg-surface rounded-2xl shadow-xl border border-outline-variant">
        <DialogHeader className="px-6 py-4 border-b border-outline-variant shrink-0 bg-surface">
          <DialogTitle className="text-lg font-bold text-on-surface">{t('dialogTitle')}</DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1 flex flex-col min-h-0 overflow-hidden bg-surface">
          {/* Search */}
          <div className="flex gap-md shrink-0">
            <div className="flex-1 flex items-center gap-2 border border-outline-variant rounded-xl px-3.5 h-10 bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <span className="material-symbols-outlined text-muted-foreground text-[20px]">search</span>
              <input
                className="flex h-full w-full bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground text-on-surface"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="material-symbols-outlined text-muted-foreground hover:text-on-surface text-[18px] cursor-pointer"
                >
                  close
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground block">{t('kindLabel')}</Label>
              <Select value={kindFilter || 'all'} onValueChange={(v) => setKindFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-full h-9 rounded-xl border-outline-variant bg-surface-container-lowest text-xs font-medium">
                  <SelectValue placeholder={t('allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allTypes')}</SelectItem>
                  <SelectItem value="Guide">{t('guide')}</SelectItem>
                  <SelectItem value="Reference">{t('reference')}</SelectItem>
                  <SelectItem value="Runbook">{t('runbook')}</SelectItem>
                  <SelectItem value="Tutorial">{t('tutorial')}</SelectItem>
                  <SelectItem value="Link">{t('link')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-muted-foreground block">{t('tagsLabel')}</Label>
              <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full h-9 justify-between rounded-xl border-outline-variant bg-surface-container-lowest text-xs font-medium text-on-surface hover:bg-surface-container-low px-3"
                  >
                    <span className="truncate">
                      {selectedTagsFilter.length === 0
                        ? t('allTags')
                        : selectedTagsFilter.length === 1
                          ? t('tagsSelected', { count: 1 })
                          : t('tagsSelectedPlural', { count: selectedTagsFilter.length })}
                    </span>
                    <span className="material-symbols-outlined text-muted-foreground text-[18px]">expand_more</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[260px] p-0 rounded-xl border-outline-variant shadow-lg" align="start">
                  <Command>
                    <CommandInput placeholder={t('searchTagsPlaceholder')} className="h-9 text-xs" />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                        {t('noTagsFound')}
                      </CommandEmpty>
                      <CommandGroup>
                        {tags.map((tag) => {
                          const isSelected = selectedTagsFilter.includes(tag.name);
                          return (
                            <CommandItem
                              key={tag.id}
                              value={tag.name}
                              onSelect={() => toggleTagFilter(tag.name)}
                              className="flex items-center justify-between text-xs cursor-pointer py-2 px-3 rounded-lg hover:bg-surface-container-high transition-colors"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="material-symbols-outlined text-[16px] text-muted-foreground">label</span>
                                <span className="font-medium text-on-surface truncate">{tag.name}</span>
                              </div>
                              {isSelected && (
                                <span className="material-symbols-outlined text-[16px] text-primary shrink-0">check</span>
                              )}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Active Tag Filter Pills */}
          {selectedTagsFilter.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-0.5">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase mr-1">{t('activeTags')}</span>
              {selectedTagsFilter.map((tagName) => (
                <Badge
                  key={tagName}
                  variant="secondary"
                  className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 rounded-lg font-medium shadow-2xs cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => toggleTagFilter(tagName)}
                >
                  <span>#{tagName}</span>
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </Badge>
              ))}
              <Button
                variant="link"
                size="sm"
                onClick={() => setSelectedTagsFilter([])}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-primary ml-1"
              >
                {t('clearTags')}
              </Button>
            </div>
          )}

          {/* Document List */}
          <div className="border border-outline-variant rounded-xl flex-1 flex flex-col min-h-[160px] overflow-hidden shadow-2xs">
            <div className="flex-1 overflow-y-auto bg-surface-container-lowest divide-y divide-outline-variant/40">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
                  <span className="material-symbols-outlined animate-spin text-2xl mb-2 text-primary">refresh</span>
                  <span>{t('loadingDocuments')}</span>
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <span className="material-symbols-outlined text-4xl mb-2 text-outline">description</span>
                  <p className="text-sm font-medium">{t('noDocumentsFound')}</p>
                  <p className="text-xs text-on-surface-variant/70 mt-0.5">{t('tryAdjusting')}</p>
                </div>
              ) : (
                documents.map((doc) => {
                  const checked = selected.has(doc.id!);
                  const docTags = normalizeTags(doc.tags);
                  return (
                    <label
                      key={doc.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors cursor-pointer select-none"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleDoc(doc)}
                        className="mr-1 flex-shrink-0"
                      />
                      <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">description</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-body-md text-sm font-semibold text-on-surface truncate">{doc.title}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-on-surface-variant font-medium px-1.5 py-0.5 rounded bg-secondary/15">
                            {doc.kind ? (kindMap[doc.kind] || doc.kind) : t('unknown')}
                          </span>
                          {docTags.length > 0 && (
                            <>
                              <span className="text-on-surface-variant/40">&middot;</span>
                              <div className="flex flex-wrap gap-1">
                                {docTags.map((t) => (
                                  <span
                                    key={t.id}
                                    className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[10px] font-medium"
                                  >
                                    #{t.name}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Documents Summary */}
          <div className="space-y-2 shrink-0 pt-1">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('selectedDocuments', { count: selected.size })}
              </Label>
              {selected.size > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSelected(new Set())}
                  className="h-auto p-0 text-xs text-primary font-semibold hover:underline"
                >
                  {t('clearAll')}
                </Button>
              )}
            </div>
            <div className="max-h-[90px] overflow-y-auto flex flex-wrap gap-1.5 p-2.5 bg-secondary/10 rounded-xl border border-outline-variant/60 min-h-[44px] items-center">
              {selected.size === 0 ? (
                <span className="text-xs text-muted-foreground italic px-1">{t('noDocumentsSelected')}</span>
              ) : (
                Array.from(selected).map((id) => {
                  const doc = knownDocs[id] || documents.find((d) => d.id === id);
                  const title = doc?.title || `Document (${id.slice(0, 8)})`;
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 bg-surface border border-primary/20 px-2.5 py-1 rounded-full shadow-2xs group hover:border-error/40 transition-colors"
                    >
                      <span className="text-xs font-medium text-on-surface truncate max-w-[180px]">{title}</span>
                      <button
                        type="button"
                        onClick={() => toggleDoc(doc || { id })}
                        className="material-symbols-outlined text-[14px] text-muted-foreground group-hover:text-error cursor-pointer transition-colors"
                        title={t('remove')}
                      >
                        close
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3.5 border-t border-outline-variant bg-muted/20 shrink-0 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="rounded-xl px-4">
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirm} className="rounded-xl px-5 shadow-xs font-semibold">
            {selected.size === 1
              ? t('addSelected', { count: selected.size })
              : t('addSelectedPlural', { count: selected.size })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


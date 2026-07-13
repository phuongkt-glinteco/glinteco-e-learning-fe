'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { documentsControllerFindAll, documentsControllerCreate } from '@/services/client';
import type { DocumentResponseDto } from '@/services/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/default/dialog';
import { Button } from '@/components/ui/default/button';
import { Input } from '@/components/ui/default/input';
import { Badge } from '@/components/ui/default/badge';
import { FileText, X, Plus, Loader2, ExternalLink } from 'lucide-react';

export interface DocumentItem {
  id?: string;
  title?: string;
  url?: string;
}

export interface DocumentPickerFieldProps {
  value?: DocumentItem[];
  onChange: (value: DocumentItem[]) => void;
  readOnly?: boolean;
}

export const documentTitleCache: Record<string, string> = {};

export function registerDocumentTitle(id: string, title: string) {
  if (id && title) {
    documentTitleCache[id] = title;
  }
}

export function getDocumentTitle(item: DocumentItem, fallbackText: string): string {
  const id = item.id;
  if (id && documentTitleCache[id]) {
    return documentTitleCache[id];
  }
  if (item.title && !item.title.startsWith('Tài liệu ID:') && !item.title.startsWith('Document ID:')) {
    return item.title;
  }
  return id ? `Document (${id.slice(0, 8)})` : fallbackText;
}

export type DocumentKind = 'Guide' | 'Reference' | 'Runbook' | 'Tutorial' | 'Link';

export const DocumentPickerField: React.FC<DocumentPickerFieldProps> = ({
  value = [],
  onChange,
  readOnly = false,
}) => {
  const t = useTranslations('PuckEditor.Common.DocumentPicker');

  const [openSelect, setOpenSelect] = useState(false);
  const [openQuickCreate, setOpenQuickCreate] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedKind, setSelectedKind] = useState<'ALL' | DocumentKind>('ALL');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DocumentResponseDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Quick Create draft state
  const [draftTitle, setDraftTitle] = useState('');
  const [draftKind, setDraftKind] = useState<DocumentKind>('Guide');
  const [draftUrl, setDraftUrl] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [titleError, setTitleError] = useState('');

  const currentItems = Array.isArray(value) ? value : [];

  const fetchDocuments = async (queryStr: string, kindFilter: 'ALL' | DocumentKind) => {
    setLoading(true);
    try {
      const res = await documentsControllerFindAll({
        query: { q: queryStr || undefined, limit: 50 },
        throwOnError: true,
      });
      const dataObj = res.data as { data?: DocumentResponseDto[] } | DocumentResponseDto[] | undefined;
      let items = Array.isArray(dataObj)
        ? dataObj
        : Array.isArray(dataObj?.data)
          ? dataObj.data
          : [];
      if (kindFilter !== 'ALL') {
        items = items.filter((doc) => doc.kind === kindFilter);
      }
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!openSelect) return;
    const timer = setTimeout(() => {
      fetchDocuments(search, selectedKind);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedKind, openSelect]);

  const handleOpenSelect = () => {
    if (readOnly) return;
    setSelectedIds(currentItems.map((item) => item.id || '').filter(Boolean));
    setSearch('');
    setSelectedKind('ALL');
    setOpenSelect(true);
  };

  const handleOpenQuickCreate = () => {
    if (readOnly) return;
    setDraftTitle('');
    setDraftKind('Guide');
    setDraftUrl('');
    setTitleError('');
    setOpenQuickCreate(true);
  };

  const toggleSelect = (doc: DocumentResponseDto) => {
    const id = doc.id;
    if (!id) return;
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirmSelect = () => {
    const newSelectedItems: DocumentItem[] = [];
    for (const id of selectedIds) {
      const existing = currentItems.find((item) => item.id === id);
      if (existing) {
        newSelectedItems.push(existing);
      } else {
        const found = results.find((r) => r.id === id);
        if (found) {
          const title = found.title || t('unnamedDocument');
          registerDocumentTitle(id, title);
          newSelectedItems.push({
            id: found.id,
            title,
            url: typeof found.url === 'string' ? found.url : undefined,
          });
        }
      }
    }
    onChange(newSelectedItems);
    setOpenSelect(false);
  };

  const handleConfirmQuickCreate = async () => {
    if (!draftTitle.trim()) {
      setTitleError(t('docTitleLabel'));
      return;
    }
    setCreateLoading(true);
    let newId = `skeleton-doc-${Date.now()}`;
    const title = draftTitle.trim();
    try {
      const res = await documentsControllerCreate({
        body: {
          title,
          kind: draftKind,
          url: draftUrl.trim() || undefined,
          content: '',
        },
      });
      if (res.data && (res.data as any).id) {
        newId = (res.data as any).id;
      }
    } catch {
      // Offline / Skeleton draft mode fallback
    } finally {
      setCreateLoading(false);
    }

    registerDocumentTitle(newId, title);
    const nextItem: DocumentItem = {
      id: newId,
      title,
      url: draftUrl.trim() || undefined,
    };
    onChange([...currentItems, nextItem]);
    setOpenQuickCreate(false);
  };

  const handleRemoveItem = (index: number) => {
    if (readOnly) return;
    const next = currentItems.filter((_, idx) => idx !== index);
    onChange(next);
  };

  const handleEditDetails = (id?: string) => {
    if (!id) return;
    window.open(`/admin/documents/${id}`, '_blank');
  };

  const kinds: Array<'ALL' | DocumentKind> = ['ALL', 'Guide', 'Reference', 'Runbook', 'Tutorial', 'Link'];

  return (
    <div className="space-y-2">
      {/* Danh sách tài liệu đã chọn */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {currentItems.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            {t('noSelection')}
          </p>
        ) : (
          currentItems.map((item, index) => {
            const displayTitle = getDocumentTitle(item, t('unnamedDocument'));
            return (
              <div
                key={item.id || index}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-container-lowest px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate font-medium text-foreground">
                    {displayTitle}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {item.id && (
                    <button
                      type="button"
                      onClick={() => handleEditDetails(item.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline px-1.5 py-0.5 rounded bg-primary/10 cursor-pointer"
                      title={t('editDetailBtn')}
                    >
                      <span>{t('editDetailBtn')}</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-muted-foreground hover:text-red-500 transition-colors p-0.5 cursor-pointer"
                      title={t('removeTitle')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Hành động: Chọn từ hệ thống / Tạo nhanh */}
      {!readOnly && (
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenSelect}
            className="text-xs h-8 flex items-center justify-center gap-1.5 border-dashed border-border hover:border-primary hover:text-primary cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t('selectExistingBtn')}</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleOpenQuickCreate}
            className="text-xs h-8 flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t('quickCreateBtn')}</span>
          </Button>
        </div>
      )}

      {/* DIALOG 1: Chọn tài liệu có sẵn từ hệ thống theo 5 loại */}
      <Dialog open={openSelect} onOpenChange={setOpenSelect}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden bg-surface border-border">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-base font-semibold text-foreground">
              {t('dialogSelectTitle')}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0 space-y-3 py-2">
            <Input
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-xs bg-surface-container-lowest border-border shrink-0"
            />

            {/* Phân loại 5 loại hình tài liệu */}
            <div className="flex flex-wrap gap-1 shrink-0">
              {kinds.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSelectedKind(k)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    selectedKind === k
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface-container-low text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {k === 'ALL' ? t('kindAll') : k}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto min-h-[160px] max-h-[320px] space-y-1.5 border border-border rounded-md p-2">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
                  {t('loadingList')}
                </div>
              ) : results.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  {t('noResults')}
                </div>
              ) : (
                results.map((doc) => {
                  const isChecked = Boolean(doc.id && selectedIds.includes(doc.id));
                  return (
                    <div
                      key={doc.id}
                      onClick={() => toggleSelect(doc)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-md cursor-pointer transition-colors border ${
                        isChecked
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent hover:bg-surface-container-low'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {doc.title || t('unnamedDocument')}
                        </p>
                        {doc.kind && (
                          <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
                            {doc.kind}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setOpenSelect(false)}>
              {t('cancelBtn')}
            </Button>
            <Button type="button" size="sm" onClick={handleConfirmSelect}>
              {t('confirmBtn')} ({selectedIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Tạo nhanh tài liệu (Skeleton Draft) */}
      <Dialog open={openQuickCreate} onOpenChange={setOpenQuickCreate}>
        <DialogContent className="max-w-md bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-foreground">
              {t('dialogQuickCreateTitle')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                {t('docTitleLabel')}
              </label>
              <Input
                placeholder={t('docTitlePlaceholder')}
                value={draftTitle}
                onChange={(e) => {
                  setDraftTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                className={`h-9 text-xs bg-surface-container-lowest ${
                  titleError ? 'border-destructive' : 'border-border'
                }`}
              />
              {titleError && (
                <p className="text-[11px] text-destructive">{titleError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                {t('docKindLabel')}
              </label>
              <select
                value={draftKind}
                onChange={(e) => setDraftKind(e.target.value as DocumentKind)}
                className="w-full h-9 text-xs rounded-md border border-border bg-surface-container-lowest px-2.5 outline-none text-foreground"
              >
                <option value="Guide">Guide</option>
                <option value="Reference">Reference</option>
                <option value="Runbook">Runbook</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Link">Link</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                {t('docUrlLabel')}
              </label>
              <Input
                placeholder={t('docUrlPlaceholder')}
                value={draftUrl}
                onChange={(e) => setDraftUrl(e.target.value)}
                className="h-9 text-xs bg-surface-container-lowest border-border"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpenQuickCreate(false)}
            >
              {t('cancelBtn')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmQuickCreate}
              disabled={createLoading}
            >
              {createLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {t('createDraftBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

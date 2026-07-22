'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { documentsControllerFindAll } from '@/services/client';
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
import { FileText, X, Plus, ExternalLink, Loader2 } from 'lucide-react';

export interface DocumentItem {
  id?: string;
  title?: string;
  url?: string;
  kind?: string;
  tags?: Array<{ id: string; name: string }>;
  description?: string;
}

export interface DocumentPickerFieldProps {
  value?: DocumentItem[];
  onChange: (value: DocumentItem[]) => void;
  readOnly?: boolean;
  maxItems?: number;
  hideList?: boolean;
  renderTrigger?: (openDialog: () => void) => React.ReactNode;
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
  maxItems,
  hideList = false,
  renderTrigger,
}) => {
  const t = useTranslations('PuckEditor.Common.DocumentPicker');

  const [openSelect, setOpenSelect] = useState(false);

  const [search, setSearch] = useState('');
  const [selectedKind, setSelectedKind] = useState<'ALL' | DocumentKind>('ALL');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DocumentResponseDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const toggleSelect = (doc: DocumentResponseDto) => {
    const id = doc.id;
    if (!id) return;
    if (currentItems.some((item) => item.id === id)) return;
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (maxItems === 1) {
        setSelectedIds([id]);
      } else {
        setSelectedIds([...selectedIds, id]);
      }
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
            kind: found.kind,
            tags: found.tags || [],
          });
        }
      }
    }
    onChange(newSelectedItems);
    setOpenSelect(false);
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
      {!hideList && (
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
                className="flex flex-col gap-2 rounded-lg border border-border bg-surface-container-lowest p-3 text-xs shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate font-semibold text-foreground text-sm">
                      {displayTitle}
                    </span>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-0.5 cursor-pointer shrink-0"
                      title={t('removeTitle')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {(item.kind || (item.tags && item.tags.length > 0)) && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.kind && (
                      <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-medium uppercase text-secondary">
                        {item.kind}
                      </span>
                    )}
                    {item.tags && item.tags.length > 0 && item.tags.map((tag, tIdx) => (
                      <span
                        key={tag.id || tIdx}
                        className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-border/60 mt-0.5">
                  {item.id ? (
                    <button
                      type="button"
                      onClick={() => handleEditDetails(item.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                      title={t('editDetailBtn')}
                    >
                      <span>{t('editDetailBtn')}</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  ) : <span />}

                  {!readOnly && maxItems === 1 && (
                    <button
                      type="button"
                      onClick={handleOpenSelect}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      <span>Thay đổi tài liệu</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      )}

      {/* Hành động: Chọn từ hệ thống */}
      {!readOnly && (!maxItems || currentItems.length < maxItems) && (
        renderTrigger ? renderTrigger(handleOpenSelect) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenSelect}
            className="w-full text-xs h-8 flex items-center justify-center gap-1.5 border-dashed border-border hover:border-primary hover:text-primary cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t('selectExistingBtn')}</span>
          </Button>
        )
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
                  const id = doc.id;
                  const isAlreadyAdded = Boolean(id && currentItems.some((item) => item.id === id));
                  const isChecked = isAlreadyAdded || Boolean(id && selectedIds.includes(id));
                  return (
                    <div
                      key={id}
                      onClick={() => !isAlreadyAdded && toggleSelect(doc)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-md transition-colors border ${
                        isAlreadyAdded
                          ? 'border-border bg-surface-container/60 opacity-60 cursor-not-allowed'
                          : isChecked
                            ? 'border-primary bg-primary/10 cursor-pointer'
                            : 'border-transparent hover:bg-surface-container-low cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isAlreadyAdded}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary shrink-0 disabled:opacity-50"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-foreground truncate">
                            {doc.title || t('unnamedDocument')}
                          </p>
                          {isAlreadyAdded && (
                            <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded border">
                              Đã thêm
                            </span>
                          )}
                        </div>
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
    </div>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
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
import { FileText, X, Plus, Loader2 } from 'lucide-react';

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

export const DocumentPickerField: React.FC<DocumentPickerFieldProps> = ({
  value = [],
  onChange,
  readOnly = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DocumentResponseDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const currentItems = Array.isArray(value) ? value : [];

  const handleOpenDialog = () => {
    if (readOnly) return;
    setSelectedIds(currentItems.map((item) => item.id || '').filter(Boolean));
    setOpen(true);
    fetchDocuments('');
  };

  const fetchDocuments = async (queryStr: string) => {
    setLoading(true);
    try {
      const res = await documentsControllerFindAll({
        query: { q: queryStr || undefined, limit: 30 },
        throwOnError: true,
      });
      const dataObj = res.data as { data?: DocumentResponseDto[] } | DocumentResponseDto[] | undefined;
      const items = Array.isArray(dataObj)
        ? dataObj
        : Array.isArray(dataObj?.data)
          ? dataObj.data
          : [];
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      fetchDocuments(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, open]);

  const toggleSelect = (doc: DocumentResponseDto) => {
    const id = doc.id;
    if (!id) return;
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirm = () => {
    const newSelectedItems: DocumentItem[] = [];

    for (const id of selectedIds) {
      const existing = currentItems.find((item) => item.id === id);
      if (existing) {
        newSelectedItems.push(existing);
      } else {
        const found = results.find((r) => r.id === id);
        if (found) {
          newSelectedItems.push({
            id: found.id,
            title: found.title || 'Tài liệu',
            url: `/documents/${found.id}`,
          });
        }
      }
    }

    onChange(newSelectedItems);
    setOpen(false);
  };

  const handleRemoveItem = (index: number) => {
    if (readOnly) return;
    const next = currentItems.filter((_, idx) => idx !== index);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {currentItems.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Chưa có tài liệu nào được chọn
          </p>
        ) : (
          currentItems.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-container-lowest px-2.5 py-1.5 text-xs"
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate font-medium text-foreground">
                  {item.title || 'Tài liệu không tên'}
                </span>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-muted-foreground hover:text-red-500 transition-colors p-0.5"
                  title="Xóa tài liệu"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpenDialog}
          className="w-full text-xs h-8 flex items-center justify-center gap-1.5 border-dashed border-border hover:border-primary hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Chọn tài liệu từ hệ thống</span>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden bg-surface border-border">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-base font-semibold text-foreground">
              Chọn tài liệu từ hệ thống
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0 space-y-3 py-2">
            <Input
              placeholder="Tìm kiếm theo tiêu đề tài liệu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-xs bg-surface-container-lowest border-border shrink-0"
            />

            <div className="flex-1 overflow-y-auto min-h-[160px] max-h-[320px] space-y-1.5 border border-border rounded-md p-2">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
                  Đang tải danh sách tài liệu...
                </div>
              ) : results.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  Không tìm thấy tài liệu phù hợp
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
                          {doc.title || 'Tài liệu'}
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
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="button" size="sm" onClick={handleConfirm}>
              Xác nhận ({selectedIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


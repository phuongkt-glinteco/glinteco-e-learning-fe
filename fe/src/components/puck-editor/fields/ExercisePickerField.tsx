'use client';

import React, { useState, useEffect } from 'react';
import { exercisesControllerFindAll } from '@/services/client';
import type { ExerciseSummaryDto } from '@/services/client';
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
import { Icon } from '@iconify/react';

export interface ExerciseItem {
  id?: string;
  title?: string;
}

export interface ExercisePickerFieldProps {
  value?: ExerciseItem[];
  onChange: (value: ExerciseItem[]) => void;
  readOnly?: boolean;
}

export const ExercisePickerField: React.FC<ExercisePickerFieldProps> = ({
  value = [],
  onChange,
  readOnly = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExerciseSummaryDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const currentItems = Array.isArray(value) ? value : [];

  const handleOpenDialog = () => {
    if (readOnly) return;
    setSelectedIds(currentItems.map((item) => item.id || '').filter(Boolean));
    setOpen(true);
    fetchExercises('');
  };

  const fetchExercises = async (queryStr: string) => {
    setLoading(true);
    try {
      const res = await exercisesControllerFindAll({
        query: { search: queryStr, limit: 30 } as any,
        throwOnError: true,
      });
      const items = (res.data as any)?.items || (Array.isArray(res.data) ? res.data : []);
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
      fetchExercises(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, open]);

  const toggleSelect = (ex: ExerciseSummaryDto) => {
    const id = ex.id;
    if (!id) return;
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirm = () => {
    const newSelectedItems: ExerciseItem[] = [];

    for (const id of selectedIds) {
      const existing = currentItems.find((item) => item.id === id);
      if (existing) {
        newSelectedItems.push(existing);
      } else {
        const found = results.find((r) => r.id === id);
        if (found) {
          newSelectedItems.push({
            id: found.id,
            title: found.title || 'Bài tập',
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
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            Chưa có bài tập nào được chọn
          </p>
        ) : (
          currentItems.map((item, index) => (
            <div
              key={item.id || index}
              className="flex items-center justify-between gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 text-xs"
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Icon icon="lucide:code" className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                  {item.title || 'Bài tập không tên'}
                </span>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                  title="Xóa bài tập"
                >
                  <Icon icon="lucide:x" className="h-3.5 w-3.5" />
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
          className="w-full text-xs h-8 flex items-center justify-center gap-1.5 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary hover:text-primary"
        >
          <Icon icon="lucide:plus" className="h-3.5 w-3.5" />
          <span>Chọn bài tập từ hệ thống</span>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Chọn bài tập từ hệ thống
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Input
              placeholder="Tìm kiếm bài tập theo tiêu đề..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-xs"
            />

            <div className="max-h-64 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-md p-2">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-xs text-slate-500">
                  <Icon icon="lucide:loader-2" className="h-4 w-4 animate-spin mr-2" />
                  Đang tải danh sách bài tập...
                </div>
              ) : results.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Không tìm thấy bài tập phù hợp
                </div>
              ) : (
                results.map((ex) => {
                  const isChecked = Boolean(ex.id && selectedIds.includes(ex.id));
                  return (
                    <div
                      key={ex.id}
                      onClick={() => toggleSelect(ex)}
                      className={`flex items-start gap-2.5 p-2 rounded-md cursor-pointer transition-colors border ${
                        isChecked
                          ? 'border-primary bg-primary/5 dark:bg-primary/10'
                          : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                          {ex.title || 'Bài tập'}
                        </p>
                        {ex.difficulty && (
                          <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
                            {ex.difficulty}
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

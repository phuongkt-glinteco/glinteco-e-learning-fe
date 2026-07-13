'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { exercisesControllerFindAll, exercisesControllerCreate } from '@/services/client';
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
import { Code, X, Plus, Loader2, ExternalLink, Copy } from 'lucide-react';

export interface ExerciseItem {
  id?: string;
  title?: string;
}

export interface ExercisePickerFieldProps {
  value?: ExerciseItem[];
  onChange: (value: ExerciseItem[]) => void;
  readOnly?: boolean;
}

export const exerciseTitleCache: Record<string, string> = {};

export function registerExerciseTitle(id: string, title: string) {
  if (id && title) {
    exerciseTitleCache[id] = title;
  }
}

export function getExerciseTitle(item: ExerciseItem, fallbackText: string): string {
  const id = item.id;
  if (id && exerciseTitleCache[id]) {
    return exerciseTitleCache[id];
  }
  if (item.title && !item.title.startsWith('Bài tập ID:')) {
    return item.title;
  }
  return id ? `Exercise (${id.slice(0, 8)})` : fallbackText;
}

export const ExercisePickerField: React.FC<ExercisePickerFieldProps> = ({
  value = [],
  onChange,
  readOnly = false,
}) => {
  const t = useTranslations('PuckEditor.Common.ExercisePicker');

  // Modal states
  const [openSelect, setOpenSelect] = useState(false);
  const [openQuickCreate, setOpenQuickCreate] = useState(false);
  const [openClone, setOpenClone] = useState(false);

  // Search / list states
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ExerciseSummaryDto[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cloneSelectedId, setCloneSelectedId] = useState<string>('');

  // Quick Create draft state
  const [draftTitle, setDraftTitle] = useState('');
  const [draftType, setDraftType] = useState<'quiz' | 'coding'>('quiz');
  const [createLoading, setCreateLoading] = useState(false);
  const [titleError, setTitleError] = useState('');

  const currentItems = Array.isArray(value) ? value : [];

  const fetchExercises = async (queryStr: string) => {
    setLoading(true);
    try {
      const res = await exercisesControllerFindAll({
        query: { limit: 50 },
        throwOnError: true,
      });
      const dataObj = res.data as
        | { data?: ExerciseSummaryDto[]; items?: ExerciseSummaryDto[] }
        | ExerciseSummaryDto[]
        | undefined;
      const items = Array.isArray(dataObj)
        ? dataObj
        : Array.isArray(dataObj?.data)
          ? dataObj.data
          : Array.isArray(dataObj?.items)
            ? dataObj.items
            : [];
      const filtered = queryStr.trim()
        ? items.filter((ex) =>
            ex.title?.toLowerCase().includes(queryStr.trim().toLowerCase())
          )
        : items;
      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!openSelect && !openClone) return;
    const timer = setTimeout(() => {
      fetchExercises(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, openSelect, openClone]);

  const handleOpenSelect = () => {
    if (readOnly) return;
    setSelectedIds(currentItems.map((item) => item.id || '').filter(Boolean));
    setSearch('');
    setOpenSelect(true);
  };

  const handleOpenQuickCreate = () => {
    if (readOnly) return;
    setDraftTitle('');
    setDraftType('quiz');
    setTitleError('');
    setOpenQuickCreate(true);
  };

  const handleOpenClone = () => {
    if (readOnly) return;
    setCloneSelectedId('');
    setSearch('');
    setOpenClone(true);
  };

  const toggleSelect = (ex: ExerciseSummaryDto) => {
    const id = ex.id;
    if (!id) return;
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirmSelect = () => {
    const newSelectedItems: ExerciseItem[] = [];
    for (const id of selectedIds) {
      const existing = currentItems.find((item) => item.id === id);
      if (existing) {
        newSelectedItems.push(existing);
      } else {
        const found = results.find((r) => r.id === id);
        if (found) {
          const title = found.title || t('unnamedExercise');
          registerExerciseTitle(id, title);
          newSelectedItems.push({
            id: found.id,
            title,
          });
        }
      }
    }
    onChange(newSelectedItems);
    setOpenSelect(false);
  };

  const handleConfirmQuickCreate = async () => {
    if (!draftTitle.trim()) {
      setTitleError(t('exerciseTitleLabel'));
      return;
    }
    setCreateLoading(true);
    let newId = `skeleton-ex-${Date.now()}`;
    const title = draftTitle.trim();
    try {
      const res = await exercisesControllerCreate({
        body: {
          title,
          trackId: '00000000-0000-0000-0000-000000000000',
          tag: draftType,
          difficulty: 'Beginner',
          estimatedTime: '15 mins',
          xp: 10,
          brief: '',
          overview: '',
          objectives: [],
          steps: [],
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

    registerExerciseTitle(newId, title);
    onChange([{ id: newId, title }]);
    setOpenQuickCreate(false);
  };

  const handleConfirmClone = () => {
    if (!cloneSelectedId) return;
    const found = results.find((r) => r.id === cloneSelectedId);
    const baseTitle = found?.title || t('unnamedExercise');
    const clonedTitle = `${baseTitle} (Copy)`;
    const newId = `clone-${cloneSelectedId}-${Date.now()}`;

    registerExerciseTitle(newId, clonedTitle);
    onChange([{ id: newId, title: clonedTitle }]);
    setOpenClone(false);
  };

  const handleRemoveItem = (index: number) => {
    if (readOnly) return;
    const next = currentItems.filter((_, idx) => idx !== index);
    onChange(next);
  };

  const handleEditDetails = (id?: string) => {
    if (!id) return;
    window.open(`/admin/exercises/${id}`, '_blank');
  };

  return (
    <div className="space-y-2">
      {/* Danh sách bài tập đã chọn */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {currentItems.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            {t('noSelection')}
          </p>
        ) : (
          currentItems.map((item, index) => {
            const displayTitle = getExerciseTitle(item, t('unnamedExercise'));
            return (
              <div
                key={item.id || index}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-container-lowest px-2.5 py-1.5 text-xs"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Code className="h-3.5 w-3.5 text-primary shrink-0" />
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

      {/* Hành động: Chọn từ hệ thống / Tạo nhanh / Clone */}
      {!readOnly && (
        <div className="flex flex-col gap-1.5">
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

          <div className="grid grid-cols-2 gap-1.5">
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

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleOpenClone}
              className="text-xs h-8 flex items-center justify-center gap-1 cursor-pointer"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>{t('cloneTemplateBtn')}</span>
            </Button>
          </div>
        </div>
      )}

      {/* DIALOG 1: Chọn bài tập có sẵn từ hệ thống */}
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
                results.map((ex) => {
                  const isChecked = Boolean(ex.id && selectedIds.includes(ex.id));
                  return (
                    <div
                      key={ex.id}
                      onClick={() => toggleSelect(ex)}
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
                          {ex.title || t('unnamedExercise')}
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
            <Button type="button" variant="outline" size="sm" onClick={() => setOpenSelect(false)}>
              {t('cancelBtn')}
            </Button>
            <Button type="button" size="sm" onClick={handleConfirmSelect}>
              {t('confirmBtn')} ({selectedIds.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: Tạo nhanh bài tập (Skeleton Draft) */}
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
                {t('exerciseTitleLabel')}
              </label>
              <Input
                placeholder={t('exerciseTitlePlaceholder')}
                value={draftTitle}
                onChange={(e) => {
                  setDraftTitle(e.target.value);
                  if (titleError) setTitleError('');
                }}
                className={`h-9 text-xs bg-surface-container-lowest ${
                  titleError ? 'border-red-500' : 'border-border'
                }`}
              />
              {titleError && (
                <p className="text-[11px] text-red-500">{titleError}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                {t('exerciseTypeLabel')}
              </label>
              <select
                value={draftType}
                onChange={(e) => setDraftType(e.target.value as 'quiz' | 'coding')}
                className="w-full h-9 text-xs rounded-md border border-border bg-surface-container-lowest px-2.5 outline-none text-foreground"
              >
                <option value="quiz">{t('typeQuiz')}</option>
                <option value="coding">{t('typeCoding')}</option>
              </select>
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

      {/* DIALOG 3: Clone bài tập từ mẫu */}
      <Dialog open={openClone} onOpenChange={setOpenClone}>
        <DialogContent className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden bg-surface border-border">
          <DialogHeader className="shrink-0">
            <DialogTitle className="text-base font-semibold text-foreground">
              {t('dialogCloneTitle')}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0 space-y-3 py-2">
            <Input
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-xs bg-surface-container-lowest border-border shrink-0"
            />

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
                results.map((ex) => {
                  const isChecked = Boolean(ex.id && cloneSelectedId === ex.id);
                  return (
                    <div
                      key={ex.id}
                      onClick={() => ex.id && setCloneSelectedId(ex.id)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-md cursor-pointer transition-colors border ${
                        isChecked
                          ? 'border-primary bg-primary/10'
                          : 'border-transparent hover:bg-surface-container-low'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 h-4 w-4 rounded-full border-border text-primary focus:ring-primary shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {ex.title || t('unnamedExercise')}
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
            <Button type="button" variant="outline" size="sm" onClick={() => setOpenClone(false)}>
              {t('cancelBtn')}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!cloneSelectedId}
              onClick={handleConfirmClone}
            >
              {t('cloneBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

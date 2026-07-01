'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  documentsControllerFindAllTags,
  documentsControllerCreateTag,
  documentsControllerDeleteTag,
} from '@/services/api-client';
import type { TagResponseDto } from '@/services/client/types.gen';
import { Button } from '@/components/ui/default/button';
import { Input } from '@/components/ui/default/input';
import { Badge } from '@/components/ui/default/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/default/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/default/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/default/dialog';
import {
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  TagIcon,
  Loader2Icon,
  AlertCircleIcon,
  RefreshCwIcon,
  CheckCircle2Icon,
  LayersIcon,
} from 'lucide-react';
import { toast } from 'sonner';

interface TagItem {
  id: string;
  name: string;
}

interface TagsManagementProps {
  onTagsUpdated?: () => void;
}

function getTagColorStyle(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [215, 250, 280, 330, 155, 38, 185, 12];
  const hue = hues[Math.abs(hash) % hues.length];
  return {
    backgroundColor: `hsl(${hue}, 85%, 93%)`,
    color: `hsl(${hue}, 80%, 26%)`,
    borderColor: `hsl(${hue}, 70%, 82%)`,
  };
}

export function TagsManagement({ onTagsUpdated }: TagsManagementProps) {
  const t = useTranslations('DocumentsPage');

  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete Confirm State
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<TagItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTags = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const res = await documentsControllerFindAllTags({ throwOnError: true });
      const rawList = (res.data as TagResponseDto[] | undefined) ?? [];
      const normalizedList: TagItem[] = rawList
        .map((t) => ({
          id: String(t.id || ''),
          name: String(t.name || ''),
        }))
        .filter((t) => Boolean(t.id && t.name));
      
      // Sort alphabetically by default
      normalizedList.sort((a, b) => a.name.localeCompare(b.name));
      setTags(normalizedList);
    } catch {
      toast.error(t('tagsFetchError', { defaultValue: 'Failed to fetch classification tags.' }));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const query = searchQuery.toLowerCase();
    return tags.filter(
      (tag) => tag.name.toLowerCase().includes(query) || tag.id.toLowerCase().includes(query)
    );
  }, [tags, searchQuery]);

  async function handleCreateTag(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const cleanName = newTagName.trim();
    if (!cleanName) {
      setCreateError(t('tagNameRequired', { defaultValue: 'Tag name cannot be empty.' }));
      return;
    }

    // Check for duplicate names
    const exists = tags.some((t) => t.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      setCreateError(t('tagAlreadyExists', { defaultValue: 'A tag with this name already exists.' }));
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      await documentsControllerCreateTag({
        body: { name: cleanName },
        throwOnError: true,
      });
      toast.success(t('tagCreateSuccess', { defaultValue: 'Tag created successfully!' }));
      setNewTagName('');
      setIsCreateOpen(false);
      await fetchTags();
      onTagsUpdated?.();
    } catch (err: any) {
      const msg = err?.message || t('tagCreateError', { defaultValue: 'Failed to create tag.' });
      setCreateError(msg);
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteTag() {
    if (!deleteConfirmTag) return;
    setDeleting(true);
    try {
      await documentsControllerDeleteTag({
        path: { id: deleteConfirmTag.id },
        throwOnError: true,
      });
      toast.success(t('tagDeleteSuccess', { name: deleteConfirmTag.name, defaultValue: `Tag "${deleteConfirmTag.name}" deleted successfully.` }));
      setDeleteConfirmTag(null);
      await fetchTags();
      onTagsUpdated?.();
    } catch (err: any) {
      const msg = err?.message || t('tagDeleteError', { defaultValue: 'Failed to delete tag. It may be currently associated with documents.' });
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Banner & Stats */}
      <Card className="border-outline-variant shadow-sm overflow-hidden relative">
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary mt-0.5 shadow-inner">
                <TagIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                    {t('tagsDirectoryTitle', { defaultValue: 'Classification Tags Management' })}
                  </CardTitle>
                  <Badge variant="secondary" className="px-2.5 py-0.5 rounded-full font-semibold bg-primary/10 text-primary border-primary/20">
                    <LayersIcon className="w-3.5 h-3.5 mr-1" />
                    {tags.length} {t('totalTags', { defaultValue: 'Total' })}
                  </Badge>
                </div>
                <CardDescription className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  {t('tagsDirectoryDesc', { defaultValue: 'Organize and structure learning materials by maintaining a clean taxonomy. Created tags are instantly available across document creation and filtering.' })}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end md:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTags(true)}
                disabled={loading || refreshing}
                className="h-10 px-3.5 gap-2 rounded-xl border-outline-variant hover:bg-surface-container font-medium transition-all"
              >
                <RefreshCwIcon className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary' : ''}`} />
                <span className="hidden sm:inline">{t('refresh', { defaultValue: 'Refresh' })}</span>
              </Button>
              <Button
                onClick={() => {
                  setNewTagName('');
                  setCreateError(null);
                  setIsCreateOpen(true);
                }}
                className="h-10 px-5 gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all transform active:scale-95"
              >
                <PlusIcon className="w-4 h-4 stroke-[2.5]" />
                {t('createTagButton', { defaultValue: 'Create New Tag' })}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Table Section */}
      <Card className="border-outline-variant shadow-sm">
        <CardHeader className="border-b border-outline-variant py-4 px-6 bg-surface-container-low/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('searchTagsPlaceholder', { defaultValue: 'Search tags by name or ID...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-background border-outline-variant focus-visible:ring-1 focus-visible:ring-primary font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground bg-surface-container px-2 py-0.5 rounded-md"
                >
                  {t('clear', { defaultValue: 'Clear' })}
                </button>
              )}
            </div>

            <div className="text-xs font-medium text-muted-foreground">
              {t('showingTagsCount', {
                count: filteredTags.length,
                total: tags.length,
                defaultValue: `Showing ${filteredTags.length} of ${tags.length} tags`,
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">
                {t('loadingTags', { defaultValue: 'Loading tags taxonomy...' })}
              </p>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mb-3 text-muted-foreground">
                <TagIcon className="w-7 h-7 stroke-1" />
              </div>
              <h4 className="text-base font-semibold text-foreground mb-1">
                {searchQuery
                  ? t('noMatchingTags', { defaultValue: 'No matching tags found' })
                  : t('noTagsYet', { defaultValue: 'No tags created yet' })}
              </h4>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                {searchQuery
                  ? t('noMatchingTagsDesc', { query: searchQuery, defaultValue: `We couldn't find any tags matching "${searchQuery}". Try adjusting your search query.` })
                  : t('noTagsYetDesc', { defaultValue: 'Create your first tag to start classifying guides, runbooks, and tutorials across the platform.' })}
              </p>
              {searchQuery ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="rounded-xl px-4 font-medium"
                >
                  {t('clearSearch', { defaultValue: 'Clear Search' })}
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="rounded-xl px-4 font-semibold gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  {t('createFirstTag', { defaultValue: 'Create First Tag' })}
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container-lowest hover:bg-surface-container-lowest border-b border-outline-variant">
                    <TableHead className="w-[80px] pl-6 font-caption-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                      #
                    </TableHead>
                    <TableHead className="font-caption-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                      {t('tagNameColumn', { defaultValue: 'Tag Name & Badge' })}
                    </TableHead>
                    <TableHead className="font-caption-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5 hidden md:table-cell">
                      {t('tagIdColumn', { defaultValue: 'System ID' })}
                    </TableHead>
                    <TableHead className="w-[120px] text-right pr-6 font-caption-bold text-on-surface-variant uppercase tracking-wider text-xs py-3.5">
                      {t('actionsColumn', { defaultValue: 'Actions' })}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-outline-variant/60">
                  {filteredTags.map((tag, idx) => {
                    const badgeStyle = getTagColorStyle(tag.name);
                    return (
                      <TableRow
                        key={tag.id}
                        className="group hover:bg-surface-container-low/60 transition-colors duration-150"
                      >
                        <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
                          {String(idx + 1).padStart(2, '0')}
                        </TableCell>
                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-3">
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border shadow-sm transition-transform group-hover:scale-[1.02]"
                              style={badgeStyle}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                              {tag.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground hidden md:table-cell select-all">
                          {tag.id}
                        </TableCell>
                        <TableCell className="text-right pr-6 py-3.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmTag(tag)}
                            className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title={t('deleteTagTooltip', { defaultValue: 'Delete Tag' })}
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Tag Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl border-outline-variant p-6 shadow-xl">
          <DialogHeader className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
              <PlusIcon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {t('createTagDialogTitle', { defaultValue: 'Create Classification Tag' })}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {t('createTagDialogDesc', { defaultValue: 'Enter a unique name for the tag. It will be immediately available across all guides, runbooks, and references.' })}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTag} className="space-y-4 pt-2">
            <div className="space-y-2">
              <label htmlFor="tag-name-input" className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant block">
                {t('tagNameLabel', { defaultValue: 'Tag Name' })} <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  id="tag-name-input"
                  placeholder={t('tagNamePlaceholder', { defaultValue: 'e.g. security, frontend, devops, database...' })}
                  value={newTagName}
                  onChange={(e) => {
                    setNewTagName(e.target.value);
                    if (createError) setCreateError(null);
                  }}
                  autoFocus
                  maxLength={40}
                  className="h-11 rounded-xl bg-background border-outline-variant font-medium text-sm focus-visible:ring-2 focus-visible:ring-primary pr-14"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-muted-foreground">
                  {newTagName.length}/40
                </span>
              </div>
              
              {/* Preview chip if typing */}
              {newTagName.trim() && (
                <div className="pt-1 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{t('preview', { defaultValue: 'Preview:' })}</span>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide border shadow-2xs animate-in zoom-in-95 duration-150"
                    style={getTagColorStyle(newTagName.trim())}
                  >
                    {newTagName.trim()}
                  </span>
                </div>
              )}

              {createError && (
                <div className="flex items-center gap-2 text-xs font-medium text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20 animate-in fade-in-50">
                  <AlertCircleIcon className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 pt-3 border-t border-outline-variant">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={creating}
                className="rounded-xl h-10 px-4 font-medium border-outline-variant hover:bg-surface-container"
              >
                {t('cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button
                type="submit"
                disabled={creating || !newTagName.trim()}
                className="rounded-xl h-10 px-5 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2"
              >
                {creating ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    <span>{t('creating', { defaultValue: 'Creating...' })}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2Icon className="w-4 h-4" />
                    <span>{t('createTagSubmit', { defaultValue: 'Create Tag' })}</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteConfirmTag)} onOpenChange={(open) => !open && setDeleteConfirmTag(null)}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl border-outline-variant p-6 shadow-xl">
          <DialogHeader className="space-y-3">
            <div className="w-11 h-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <Trash2Icon className="w-6 h-6 stroke-[2]" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              {t('confirmDeleteTagTitle', { defaultValue: 'Delete Classification Tag?' })}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {t('confirmDeleteTagDesc', { defaultValue: 'Are you sure you want to delete the tag' })}
              {deleteConfirmTag && (
                <span className="font-bold text-foreground bg-surface-container px-2 py-0.5 rounded-md ml-1.5 inline-block font-mono">
                  &quot;{deleteConfirmTag.name}&quot;
                </span>
              )}
              {'. '}
              {t('confirmDeleteTagWarning', { defaultValue: 'This action will permanently remove the tag from all associated documents and cannot be undone.' })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 pt-4 border-t border-outline-variant mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmTag(null)}
              disabled={deleting}
              className="rounded-xl h-10 px-4 font-medium border-outline-variant hover:bg-surface-container"
            >
              {t('cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTag}
              disabled={deleting}
              className="rounded-xl h-10 px-5 font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm gap-2"
            >
              {deleting ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  <span>{t('deleting', { defaultValue: 'Deleting...' })}</span>
                </>
              ) : (
                <>
                  <Trash2Icon className="w-4 h-4" />
                  <span>{t('deleteTagConfirm', { defaultValue: 'Delete Permanently' })}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

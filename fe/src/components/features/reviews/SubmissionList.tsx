import { useTranslations } from 'next-intl';
import Avatar from '@/components/ui/Avatar';
import { Button } from '@/components/ui/default/button';
import { Badge } from '@/components/ui/default/badge';
import { ScrollArea } from '@/components/ui/default/scroll-area';
import { Skeleton } from '@/components/ui/default/skeleton';
import type { SubmissionFeedItemDto } from '@/services/api-client';

interface SubmissionListProps {
  submissions: SubmissionFeedItemDto[];
  selectedId: string | null;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onSelect: (sub: SubmissionFeedItemDto) => void;
  onLoadMore: () => void;
  formatRelative: (iso: string) => string;
  getBadgeVariant: (status: string) => any;
}

export function SubmissionList({
  submissions,
  selectedId,
  loading,
  loadingMore,
  hasMore,
  onSelect,
  onLoadMore,
  formatRelative,
  getBadgeVariant,
}: SubmissionListProps) {
  const t = useTranslations('ReviewQueuePage');

  return (
    <div className="col-span-12 lg:col-span-5 xl:col-span-4 bg-card border rounded-xl overflow-hidden flex flex-col shadow-sm">
      <div className="p-4 border-b bg-muted/40">
        <p className="text-sm font-medium text-muted-foreground">
          {loading && !loadingMore
            ? t('loading')
            : t('submissionsCount', { count: submissions.length })}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y">
          {loading && !loadingMore ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 flex gap-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <span className="material-symbols-outlined text-[40px] mb-3 opacity-50">
                rate_review
              </span>
              <p className="text-sm">{t('noSubmissions')}</p>
            </div>
          ) : (
            <>
              {submissions.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => onSelect(sub)}
                  className={`w-full text-left p-4 hover:bg-accent/50 transition-colors ${
                    selectedId === sub.id
                      ? 'bg-accent/80 border-l-4 border-l-primary'
                      : 'border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={sub.user?.name ?? t('unknown')} hue={sub.user?.avatarHue} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {sub.user?.name ?? t('unknown')}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mb-2">
                        {sub.exercise && typeof sub.exercise === 'object' && 'title' in sub.exercise
                          ? (sub.exercise as { title: string }).title
                          : typeof sub.exercise === 'string'
                          ? sub.exercise
                          : ''}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getBadgeVariant(sub.status)}
                          className="uppercase text-[10px] px-1.5 py-0"
                        >
                          {t(sub.status) || sub.status}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {formatRelative(sub.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {hasMore && (
                <div className="p-4 flex justify-center border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLoadMore}
                    disabled={loadingMore}
                    className="w-full"
                  >
                    {loadingMore ? (
                      <span className="material-symbols-outlined animate-spin mr-2 text-[16px]">
                        sync
                      </span>
                    ) : null}
                    {t('loadMore')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

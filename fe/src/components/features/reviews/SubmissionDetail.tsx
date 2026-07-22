import { useTranslations } from 'next-intl';
import Avatar from '@/components/ui/Avatar';
import { Button } from '@/components/ui/default/button';
import { Badge } from '@/components/ui/default/badge';
import { ScrollArea } from '@/components/ui/default/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/default/tabs';
import { Skeleton } from '@/components/ui/default/skeleton';
import type { SubmissionFeedItemDto, SubmissionHistoryItemDto } from '@/services/api-client';

interface SubmissionDetailProps {
  selected: SubmissionFeedItemDto | null;
  history: SubmissionHistoryItemDto[];
  historyLoading: boolean;
  onOpenReview: (action: 'approve' | 'changes') => void;
  formatRelative: (iso: string) => string;
  historyActionLabel: (status: string) => string;
}

export function SubmissionDetail({
  selected,
  history,
  historyLoading,
  onOpenReview,
  formatRelative,
  historyActionLabel,
}: SubmissionDetailProps) {
  const t = useTranslations('ReviewQueuePage');

  if (!selected) {
    return (
      <div className="col-span-12 lg:col-span-7 xl:col-span-8 bg-card border rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
          <span className="material-symbols-outlined text-[56px] mb-4 opacity-50">chevron_left</span>
          <p className="font-medium">{t('selectSubmission')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 lg:col-span-7 xl:col-span-8 bg-card border rounded-xl overflow-hidden flex flex-col shadow-sm">
      <div className="p-6 border-b">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={selected.user?.name ?? t('unknown')} hue={selected.user?.avatarHue} size={48} />
            <div>
              <h2 className="text-xl font-bold">{selected.user?.name ?? t('unknown')}</h2>
              <p className="text-sm text-muted-foreground">
                {selected.exercise && typeof selected.exercise === 'object' && 'title' in selected.exercise
                  ? (selected.exercise as { title: string }).title
                  : typeof selected.exercise === 'string'
                  ? selected.exercise
                  : ''}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <a href={selected.prUrl} target="_blank" rel="noopener noreferrer">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>PR</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="review" className="flex flex-col flex-1 min-h-0">
        <div className="px-6 border-b">
          <TabsList className="bg-transparent w-full justify-start h-auto p-0 border-b-0 gap-4 rounded-none">
            <TabsTrigger
              value="review"
              className="rounded-none !border-t-0 !border-l-0 !border-r-0 border-b-2 border-transparent data-[state=active]:!border-b-primary data-[state=active]:shadow-none py-3 px-1 bg-transparent hover:bg-transparent data-[state=active]:bg-transparent focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none transition-all text-on-surface-variant hover:text-on-surface data-[state=active]:text-primary"
            >
              {t('reviewActions')}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-none !border-t-0 !border-l-0 !border-r-0 border-b-2 border-transparent data-[state=active]:!border-b-primary data-[state=active]:shadow-none py-3 px-1 bg-transparent hover:bg-transparent data-[state=active]:bg-transparent focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none transition-all text-on-surface-variant hover:text-on-surface data-[state=active]:text-primary"
            >
              {t('history')}
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="review" className="p-6 m-0 border-none outline-none">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                {t('submittedAt')}: {formatRelative(selected.submittedAt)}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => onOpenReview('approve')}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {t('approve')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => onOpenReview('changes')}
                  className="gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">rate_review</span>
                  {t('requestChanges')}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-6 m-0 border-none outline-none">
            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <Skeleton className="w-full h-16 rounded-xl" />
                <Skeleton className="w-full h-16 rounded-xl" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <span className="material-symbols-outlined text-[32px] block mb-2 opacity-50">
                  history
                </span>
                <p className="text-sm">{t('historyEmpty')}</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
                <div className="space-y-6">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 z-10 border border-background">
                        <span className="material-symbols-outlined text-[16px] text-muted-foreground">
                          {item.status === 'approved'
                            ? 'check_circle'
                            : item.status === 'changes'
                            ? 'rate_review'
                            : 'schedule'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className="uppercase text-[10px] px-1.5 py-0 font-bold bg-background"
                          >
                            {historyActionLabel(item.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatRelative(item.submittedAt)}
                          </span>
                        </div>
                        {item.reviewNote && typeof item.reviewNote === 'string' && (
                          <div className="text-sm text-foreground bg-muted/50 border rounded-lg px-4 py-3">
                            {item.reviewNote}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

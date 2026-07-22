import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/default/button';
import { Textarea } from '@/components/ui/default/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/default/dialog';

interface ReviewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  action: 'approve' | 'changes' | null;
  note: string;
  onNoteChange: (note: string) => void;
  error: string | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ReviewModal({
  isOpen,
  onOpenChange,
  action,
  note,
  onNoteChange,
  error,
  loading,
  onConfirm,
  onCancel,
}: ReviewModalProps) {
  const t = useTranslations('ReviewQueuePage');

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {action === 'approve' ? t('approve') : t('requestChanges')}
          </DialogTitle>
          <DialogDescription>
            {action === 'approve' ? t('approveConfirm') : t('requestChangesConfirm')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <label className="text-sm font-medium mb-2 block">
            {t('reviewNoteLabel')}{' '}
            {action === 'approve' ? (
              <span className="text-muted-foreground font-normal">({t('optional')})</span>
            ) : (
              <span className="text-destructive">*</span>
            )}
          </label>
          <Textarea
            className={`resize-none min-h-[100px] ${
              error === 'noteRequired' ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
            placeholder={t('reviewNotePlaceholder')}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            autoFocus={action === 'changes'}
          />
          {error === 'noteRequired' && (
            <p className="text-destructive text-xs mt-2">{t('noteRequired')}</p>
          )}
          {error && error !== 'noteRequired' && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive text-sm">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <p>{t(error)}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {t('cancel')}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            variant={action === 'approve' ? 'default' : 'destructive'}
            className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {loading && (
              <span className="material-symbols-outlined text-[16px] animate-spin mr-2">sync</span>
            )}
            {action === 'approve' ? t('approve') : t('requestChanges')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

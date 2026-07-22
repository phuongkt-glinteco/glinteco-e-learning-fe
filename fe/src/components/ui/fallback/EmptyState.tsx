import type { ReactNode } from 'react';
import { Button } from '@/components/ui/default/button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({
  icon = 'search_off',
  title,
  description,
  actionLabel,
  onAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-4 py-12 text-center">
      <span className="material-symbols-outlined mb-4 text-[48px] text-muted-foreground">
        {icon}
      </span>
      <h2 className="max-w-xl text-lg font-semibold text-foreground break-words">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-xl text-sm text-muted-foreground break-words">
          {description}
        </p>
      ) : null}
      {children}
      {actionLabel && onAction ? (
        <Button className="mt-6" variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/default/card';
import { Button } from '@/components/ui/default/button';
import { Switch } from '@/components/ui/default/switch';
import type { NotificationSettings, NotificationType } from './types';

interface NotificationSettingsItem {
  key: NotificationType;
  title: string;
}

interface NotificationSettingsViewProps {
  title: string;
  description: string;
  backLabel: string;
  loadingLabel: string;
  errorTitle: string;
  errorDescription: string;
  retryLabel: string;
  savingLabel: string;
  settings: NotificationSettings;
  items: NotificationSettingsItem[];
  loading: boolean;
  error: boolean;
  savingKey: NotificationType | null;
  onRetry: () => void;
  onBack: () => void;
  onToggle: (key: NotificationType, checked: boolean) => void;
}

export function NotificationSettingsView({
  title,
  description,
  backLabel,
  loadingLabel,
  errorTitle,
  errorDescription,
  retryLabel,
  savingLabel,
  settings,
  items,
  loading,
  error,
  savingKey,
  onRetry,
  onBack,
  onToggle,
}: NotificationSettingsViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-4 sm:p-8">
      <div className="flex items-center gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          {backLabel}
        </Button>
      </div>

      <Card className="border-outline-variant bg-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-on-surface">
            <span className="material-symbols-outlined text-primary">notifications</span>
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              {loadingLabel}
            </div>
          ) : error ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
              <span className="material-symbols-outlined text-[28px] text-error">error</span>
              <div className="space-y-1">
                <p className="font-semibold text-on-surface">{errorTitle}</p>
                <p className="text-sm text-on-surface-variant">{errorDescription}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                {retryLabel}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const checked = settings[item.key];
                const saving = savingKey === item.key;
                const disabled = savingKey !== null;

                return (
                  <div
                    key={item.key}
                    className={`flex items-start justify-between gap-4 py-3 ${
                      index < items.length - 1 ? 'border-b border-outline-variant/50' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-on-surface">{item.title}</p>
                      {saving ? (
                        <p className="mt-1 text-xs text-on-surface-variant">{savingLabel}</p>
                      ) : null}
                    </div>
                    <Switch
                      checked={checked}
                      disabled={disabled}
                      aria-label={item.title}
                      onCheckedChange={(nextChecked) => onToggle(item.key, nextChecked)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

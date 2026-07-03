'use client';

import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/default/tabs';
import type { LeaderboardScope } from '../types';

interface LeaderboardScopeTabsProps {
  scope: LeaderboardScope;
  onScopeChange: (scope: LeaderboardScope) => void;
}

export function LeaderboardScopeTabs({
  scope,
  onScopeChange,
}: LeaderboardScopeTabsProps) {
  const t = useTranslations('LeaderboardPage');

  return (
    <Tabs
      value={scope}
      onValueChange={(value) => onScopeChange(value as LeaderboardScope)}
      className=""
    >
      <TabsList
        variant="line"
        className="h-auto w-full gap-2 rounded-2xl bg-transparent p-1 sm:w-fit"
      >
        <TabsTrigger
          value="cohort"
          className="min-h-11 rounded-xl border border-outline bg-white px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-slate-100 data-active:!border-primary data-active:!bg-primary data-active:!text-primary-foreground data-active:shadow-sm hover:data-active:!bg-primary/90 after:hidden hover:-translate-y-0.5"
        >
          {t('myCohort')}
        </TabsTrigger>
        <TabsTrigger
          value="global"
          className="min-h-11 rounded-xl border border-outline bg-white px-4 py-2 text-sm font-semibold text-on-surface transition-colors hover:bg-slate-100 data-active:!border-primary data-active:!bg-primary data-active:!text-primary-foreground data-active:shadow-sm hover:data-active:!bg-primary/90 after:hidden hover:-translate-y-0.5"
        >
          {t('global')}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

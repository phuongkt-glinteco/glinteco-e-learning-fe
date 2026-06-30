'use client';

import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/default/card';

interface StatsCardProps {
  label: string;
  value: string;
  sub: string;
  icon: string;
  accent?: string;
  children?: ReactNode;
}

export default function StatsCard({ label, value, sub, icon, accent = 'text-on-surface-variant', children }: StatsCardProps) {
  return (
    <Card className="h-full border-outline-variant shadow-sm flex flex-col justify-between overflow-hidden">
      <CardContent className="p-4 sm:p-5 flex flex-col justify-between flex-1">
        <div className="flex justify-between items-start mb-4">
          <span className="text-on-surface-variant text-sm font-semibold">{label}</span>
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </div>
        </div>
        <div className="mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface">{value}</span>
            <span className={`text-xs font-bold ${accent}`}>{sub}</span>
          </div>
          {children && <div className="mt-2">{children}</div>}
        </div>
      </CardContent>
    </Card>
  );
}

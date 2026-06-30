'use client';

import type { ReactNode } from 'react';

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
    <div className="bg-surface border border-outline-variant/70 p-md rounded-lg flex flex-col justify-between shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex justify-between items-start">
        <span className="text-on-surface-variant font-label-md">{label}</span>
        <span className="material-symbols-outlined text-primary-container/20">{icon}</span>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{value}</span>
          <span className={`text-xs font-semibold ${accent}`}>{sub}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

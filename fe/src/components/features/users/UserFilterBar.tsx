'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';

interface UserFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  cohort: string;
  onCohortChange: (value: string) => void;
  cohortOptions: string[];
}

export function UserFilterBar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  cohort,
  onCohortChange,
  cohortOptions,
}: UserFilterBarProps) {
  const t = useTranslations('UsersPage');

  return (
    <div className="bg-surface-container-lowest dark:bg-surface-container-low rounded-xl border border-outline-variant p-4 mb-stack-lg shadow-sm flex flex-wrap gap-4 items-center">
      {/* Search Input */}
      <div className="flex-1 min-w-[280px] relative">
        <Icon
          icon="lucide:search"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-9 py-2.5 bg-surface-bright dark:bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <Icon icon="lucide:x-circle" className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selectors and Filter Buttons */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Role Select */}
        <div className="relative min-w-[140px]">
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full h-10 pl-3 pr-8 rounded-lg border border-outline-variant bg-surface-bright dark:bg-surface-container text-sm text-on-surface appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow duration-200"
          >
            <option value="">{t('filter_all_roles')}</option>
            <option value="Learner">{t('role_learner')}</option>
            <option value="Admin">{t('role_admin')}</option>
          </select>
          <Icon
            icon="lucide:chevron-down"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none w-4 h-4"
          />
        </div>

        {/* Cohort Select */}
        <div className="relative min-w-[180px]">
          <select
            value={cohort}
            onChange={(e) => onCohortChange(e.target.value)}
            className="w-full h-10 pl-3 pr-8 rounded-lg border border-outline-variant bg-surface-bright dark:bg-surface-container text-sm text-on-surface appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-shadow duration-200"
          >
            <option value="">{t('filter_all_cohorts')}</option>
            {cohortOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <Icon
            icon="lucide:chevron-down"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none w-4 h-4"
          />
        </div>

        {/* Filter button */}
        <button
          type="button"
          onClick={() => {
            onSearchChange('');
            onRoleChange('');
            onCohortChange('');
          }}
          title="Reset filters"
          className="h-10 px-3 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-low dark:hover:bg-surface-container rounded-lg transition-colors border border-outline-variant cursor-pointer"
        >
          <Icon icon="lucide:filter-x" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Users, ChevronsUpDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Skeleton from '@/components/ui/loading/Skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/default/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/default/command';
import type { CohortSummaryDto } from '@/services/api-client';
import { UserActionsDropdown } from './UserActionsDropdown';
import type { UserDto } from './types';

interface UserListTableProps {
  users: UserDto[];
  cohorts?: CohortSummaryDto[];
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onBanUser: (user: UserDto) => void;
  onUnbanUser: (user: UserDto) => void;
  onViewBanStatus: (user: UserDto) => void;
  onDeleteUser: (user: UserDto) => void;
  onChangeRole: (userId: string, newRole: string) => void;
  onChangeCohort: (userId: string, newCohort: string) => void;
}

export function UserListTable({
  users,
  cohorts = [],
  isLoading,
  total,
  page,
  limit,
  onPageChange,
  onBanUser,
  onUnbanUser,
  onViewBanStatus,
  onDeleteUser,
  onChangeRole,
  onChangeCohort,
}: UserListTableProps) {
  const t = useTranslations('UsersPage');

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startRecord = total > 0 ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(page * limit, total);

  function getPageNumbers(): (number | 'ellipsis')[] {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('ellipsis');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  }

  return (
    <div className="bg-surface-container-lowest dark:bg-surface-container-low rounded-xl border border-outline-variant overflow-hidden shadow-sm flex flex-col">
      <div className="overflow-x-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-6 space-y-4 w-full">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={56} rounded="rounded-lg" className="w-full" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-surface-container-low dark:bg-surface-container flex items-center justify-center">
              <Users className="w-6 h-6 text-on-surface-variant" />
            </div>
            <p className="text-sm font-medium text-on-surface">{t('searchPlaceholder')}</p>
            <p className="text-xs text-on-surface-variant">Không có dữ liệu người dùng phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low dark:bg-surface-container border-b border-outline-variant text-on-surface-variant">
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                  {t('col_user')}
                </th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                  {t('col_role')}
                </th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">
                  {t('col_cohort')}
                </th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">
                  {t('col_actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {users.map((user) => {
                const isAdmin = user.role === 'Admin';
                const roleBadgeCls = isAdmin
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
                const roleIcon = isAdmin ? 'lucide:shield-check' : 'lucide:user';

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-surface-container-low/50 dark:hover:bg-surface-container/50 transition-colors duration-150 group"
                  >
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0"
                          style={{ backgroundColor: user.avatarColorHsl }}
                        >
                          {user.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-on-surface truncate">
                              {user.fullName}
                            </p>
                            {user.status === 'banned' && (
                              <span
                                className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-100 text-red-700 border border-red-300 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800 shrink-0"
                                title={user.banReason || t('status_banned')}
                              >
                                {t('status_banned')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-on-surface-variant truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={user.role.toLowerCase()}
                        onChange={(e) => onChangeRole(user.id, e.target.value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border ${roleBadgeCls} focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer`}
                      >
                        <option value="admin">{t('role_admin')}</option>
                        <option value="learner">{t('role_learner')}</option>
                      </select>
                    </td>

                    {/* Cohort Dropdown */}
                    <td className="px-6 py-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="flex items-center justify-between w-full max-w-[180px] gap-2 text-sm text-on-surface font-medium bg-transparent border border-transparent hover:border-outline-variant focus:border-primary rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer">
                            <span className="truncate">{user.cohortName || t('select_cohort_placeholder', { fallback: 'Select cohort' })}</span>
                            <ChevronsUpDown className="w-3.5 h-3.5 opacity-50 shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[220px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder={t('search_cohort', { fallback: 'Search cohort...' })} />
                            <CommandList>
                              <CommandEmpty>{t('no_cohort_found', { fallback: 'No cohort found.' })}</CommandEmpty>
                              <CommandGroup>
                                {cohorts?.map((cohort) => (
                                  <CommandItem
                                    key={cohort.id}
                                    value={cohort.name}
                                    onSelect={() => {
                                      onChangeCohort(user.id, cohort.id);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        user.cohortName === cohort.name ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {cohort.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </td>

                    {/* Actions Menu */}
                    <td className="px-6 py-4 text-right">
                      <UserActionsDropdown
                        user={user}
                        onBan={onBanUser}
                        onUnban={onUnbanUser}
                        onViewBanStatus={onViewBanStatus}
                        onDelete={onDeleteUser}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer / Pagination */}
      {!isLoading && total > 0 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-outline-variant bg-surface-bright dark:bg-surface-container flex-wrap gap-4">
          <p className="text-sm text-on-surface-variant">
            {t('showing_pagination', {
              from: startRecord,
              to: endRecord,
              total: total.toLocaleString(),
            })}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-on-surface-variant cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getPageNumbers().map((p, idx) =>
              p === 'ellipsis' ? (
                <span key={`ell-${idx}`} className="px-2 text-sm text-on-surface-variant">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                    page === p
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-low dark:hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-on-surface-variant cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

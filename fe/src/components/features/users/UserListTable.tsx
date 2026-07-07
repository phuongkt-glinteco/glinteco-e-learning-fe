'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import Skeleton from '@/components/ui/loading/Skeleton';
import { UserActionsDropdown } from './UserActionsDropdown';
import type { UserDto } from './types';

interface UserListTableProps {
  users: UserDto[];
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onViewUser: (user: UserDto) => void;
  onEditUser: (user: UserDto) => void;
  onDeleteUser: (user: UserDto) => void;
}

export function UserListTable({
  users,
  isLoading,
  total,
  page,
  limit,
  onPageChange,
  onViewUser,
  onEditUser,
  onDeleteUser,
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
              <Icon icon="lucide:users" className="w-6 h-6 text-on-surface-variant" />
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
                          <p
                            onClick={() => onViewUser(user)}
                            className="font-semibold text-sm text-on-surface hover:text-primary transition-colors cursor-pointer truncate"
                          >
                            {user.fullName}
                          </p>
                          <p className="text-xs text-on-surface-variant truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleBadgeCls}`}
                      >
                        <Icon icon={roleIcon} className="w-3.5 h-3.5" />
                        <span>{user.role === 'Admin' ? t('role_admin') : t('role_learner')}</span>
                      </span>
                    </td>

                    {/* Cohort Name */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-on-surface font-medium">
                        {user.cohortName}
                      </span>
                    </td>

                    {/* Actions Menu */}
                    <td className="px-6 py-4 text-right">
                      <UserActionsDropdown
                        user={user}
                        onView={onViewUser}
                        onEdit={onEditUser}
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
              <Icon icon="lucide:chevron-left" className="w-4 h-4" />
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
              <Icon icon="lucide:chevron-right" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

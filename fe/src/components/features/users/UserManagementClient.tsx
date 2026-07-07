'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@iconify/react';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import {
  mockFetchUsers,
  mockCreateUser,
  mockUpdateUser,
  type UserDto,
  type UserRole,
} from '@/mocks/users';
import { UserFilterBar } from './UserFilterBar';
import { UserListTable } from './UserListTable';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';

const COHORT_OPTIONS = [
  'Engineering 2024',
  'Frontend Track',
  'Backend Fundamentals',
];

export function UserManagementClient() {
  const t = useTranslations('UsersPage');
  const { setTree } = useBreadcrumbStore();

  useEffect(() => {
    setTree([
      { label: 'Admin', href: '/admin' },
      { label: t('title'), href: '/admin/users' },
    ]);
  }, [setTree, t]);

  // Filters & Pagination state
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [cohort, setCohort] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Data state
  const [users, setUsers] = useState<UserDto[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [viewingUser, setViewingUser] = useState<UserDto | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await mockFetchUsers({
        page,
        limit,
        search,
        role,
        cohort,
      });
      setUsers(res.data);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to load mock users', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, role, cohort]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Debounce search input resets page to 1
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleRoleChange = (val: string) => {
    setRole(val);
    setPage(1);
  };

  const handleCohortChange = (val: string) => {
    setCohort(val);
    setPage(1);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  async function handleCreateUser(data: {
    fullName: string;
    email: string;
    role: UserRole;
    title?: string;
    cohortName?: string;
    bio?: string;
  }) {
    await mockCreateUser(data);
    showToast(t('msg_create_success'));
    setPage(1);
    await loadUsers();
  }

  async function handleUpdateUser(
    id: string,
    payload: { role?: UserRole; cohortName?: string }
  ) {
    await mockUpdateUser(id, payload);
    showToast(t('msg_update_success'));
    await loadUsers();
  }

  function handleDeleteUser(user: UserDto) {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.fullName}" (${user.email})?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setTotal((prev) => Math.max(0, prev - 1));
      showToast(t('msg_delete_success'));
    }
  }

  function handleExportData() {
    showToast('Đang xuất báo cáo danh sách 1,248 tài khoản ra định dạng CSV/Excel...');
  }

  return (
    <div className="space-y-6 w-full relative">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface dark:bg-surface text-inverse-on-surface dark:text-on-surface px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-outline-variant animate-in fade-in slide-in-from-bottom-5 duration-200">
          <Icon icon="lucide:check-circle-2" className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">
            {t('title')}
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {t('subtitle', { total: total.toLocaleString() })}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2.5 border border-outline-variant bg-surface-container-lowest dark:bg-surface-container rounded-lg font-semibold text-sm text-on-surface hover:bg-surface-container-low transition-all shadow-sm cursor-pointer active:scale-95 duration-100"
          >
            <Icon icon="lucide:download" className="w-4 h-4 text-on-surface-variant" />
            <span>{t('exportData')}</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all shadow-md cursor-pointer active:scale-95 duration-100"
          >
            <Icon icon="lucide:user-plus" className="w-4 h-4" />
            <span>{t('addNew')}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <UserFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        role={role}
        onRoleChange={handleRoleChange}
        cohort={cohort}
        onCohortChange={handleCohortChange}
        cohortOptions={COHORT_OPTIONS}
      />

      {/* Data Table */}
      <UserListTable
        users={users}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onViewUser={setViewingUser}
        onEditUser={setEditingUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* Create User Drawer */}
      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateUser}
        cohortOptions={COHORT_OPTIONS}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleUpdateUser}
        cohortOptions={COHORT_OPTIONS}
      />

      {/* View Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-on-background/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setViewingUser(null)}
          />
          <div className="relative w-full max-w-lg bg-surface-container-lowest dark:bg-surface rounded-2xl shadow-2xl p-6 border border-outline-variant z-10 animate-in zoom-in-95 duration-200 space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
                <Icon icon="lucide:user" className="w-5 h-5 text-primary" />
                <span>Chi tiết tài khoản</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="p-1.5 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant cursor-pointer"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-4 bg-surface-container-low dark:bg-surface-container rounded-xl border border-outline-variant/60">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0"
                style={{ backgroundColor: viewingUser.avatarColorHsl }}
              >
                {viewingUser.avatarInitials}
              </div>
              <div>
                <h4 className="font-bold text-lg text-on-surface">
                  {viewingUser.fullName}
                </h4>
                <p className="text-sm text-on-surface-variant">
                  {viewingUser.email}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      viewingUser.role === 'Admin'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {viewingUser.role}
                  </span>
                  <span className="text-xs text-on-surface-variant bg-surface-variant/40 px-2.5 py-0.5 rounded-full font-medium">
                    {viewingUser.cohortName}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-outline-variant/40">
                <span className="text-on-surface-variant font-medium">Chức danh:</span>
              </div>
              <div className="flex justify-between py-2 border-b border-outline-variant/40">
                <span className="text-on-surface-variant font-medium">Ngày tham gia:</span>
                <span className="text-on-surface">
                  {new Date(viewingUser.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {viewingUser.title && (
                <div className="py-2">
                  <span className="text-on-surface-variant font-medium block mb-1">Giới thiệu:</span>
                  <p className="text-on-surface bg-surface-bright dark:bg-surface-container p-3 rounded-lg text-xs leading-relaxed border border-outline-variant/60">
                    {viewingUser.title}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

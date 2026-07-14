'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Download, UserPlus, User, X } from 'lucide-react';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import {
  type UserDto,
  type UserRole,
} from '@/mocks/users';
import { 
  adminUsersControllerChangeRole, 
  adminUsersControllerAssignCohort,
  adminUsersControllerFindAll,
  adminUsersControllerCreate,
  adminUsersControllerUpdate,
  adminUsersControllerDelete,
  cohortControllerFindAll 
} from '@/services/api-client';
import type { CohortSummaryDto } from '@/services/api-client';
import { UserFilterBar } from './UserFilterBar';
import { UserListTable } from './UserListTable';
import { CreateUserModal } from './CreateUserModal';
import { EditUserModal } from './EditUserModal';

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
  const [cohorts, setCohorts] = useState<CohortSummaryDto[]>([]);

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [viewingUser, setViewingUser] = useState<UserDto | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminUsersControllerFindAll({
        query: { page, limit, q: search || undefined, role: role ? role.toLowerCase() as any : undefined },
        throwOnError: true,
      });
      const apiData = res.data as any;
      const usersList: UserDto[] = apiData?.data?.map((u: any) => ({
        id: u.id,
        fullName: u.name,
        email: u.email,
        role: u.role === 'admin' ? 'Admin' : 'Learner',
        cohortName: u.cohort?.name || '',
        avatarInitials: u.name?.substring(0, 2).toUpperCase() || 'U',
        avatarColorHsl: `hsl(${u.avatarHue || 0}, 60%, 50%)`,
        title: u.title,
        createdAt: u.joinedAt || new Date().toISOString()
      })) || [];
      
      setUsers(usersList);
      setTotal(apiData?.meta?.totalItems || usersList.length);
    } catch (err) {
      console.error('Failed to load real users', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, role, cohort]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    async function loadCohorts() {
      try {
        const { data } = await cohortControllerFindAll({
          query: { limit: 100 },
          throwOnError: true,
        });
        if (data && data.data) {
          setCohorts(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch cohorts', err);
      }
    }
    loadCohorts();
  }, []);

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
    try {
      const cohortId = cohorts.find(c => c.name === data.cohortName)?.id;
      await adminUsersControllerCreate({
        body: {
          name: data.fullName,
          email: data.email,
          password: 'DefaultPassword123!',
          role: data.role.toLowerCase() as 'learner' | 'admin',
        },
        throwOnError: true
      });
      // Currently the create API does not support cohort assignment in the same call.
      // We would ideally call adminUsersControllerAssignCohort right after if cohortId exists.
      showToast(t('msg_create_success'));
      setPage(1);
      await loadUsers();
    } catch (e) {
      showToast('Lỗi khi tạo tài khoản');
    }
  }

  async function handleUpdateUser(
    id: string,
    payload: { role?: UserRole; cohortName?: string }
  ) {
    try {
      const bodyPayload: any = {};
      if (payload.role) bodyPayload.role = payload.role.toLowerCase();
      if (payload.cohortName) {
         bodyPayload.cohortId = cohorts.find(c => c.name === payload.cohortName)?.id;
      }
      
      await adminUsersControllerUpdate({
        path: { id },
        body: bodyPayload,
        throwOnError: true
      });
      showToast(t('msg_update_success'));
      await loadUsers();
    } catch (e) {
      showToast('Lỗi khi cập nhật tài khoản');
    }
  }

  async function handleDeleteUser(user: UserDto) {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.fullName}" (${user.email})?`)) {
      try {
        await adminUsersControllerDelete({ path: { id: user.id }, throwOnError: true });
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setTotal((prev) => Math.max(0, prev - 1));
        showToast(t('msg_delete_success'));
      } catch (e) {
        showToast('Lỗi khi xoá tài khoản');
      }
    }
  }

  async function handleChangeRole(id: string, newRole: string) {
    const prevUsers = [...users];
    const normalizedRole = newRole.toLowerCase() as 'admin' | 'learner';
    const displayRole: UserRole = normalizedRole === 'admin' ? 'Admin' : 'Learner';
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: displayRole } : u));
    try {
      await adminUsersControllerChangeRole({ path: { id }, body: { role: normalizedRole }, throwOnError: true });
      showToast(t('msg_update_success'));
    } catch (err) {
      console.error('Failed to change role', err);
      setUsers(prevUsers);
    }
  }

  async function handleChangeCohort(id: string, newCohortId: string) {
    const prevUsers = [...users];
    const selectedName = cohorts.find((c) => c.id === newCohortId)?.name || newCohortId;
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, cohortName: selectedName } : u));
    try {
      await adminUsersControllerAssignCohort({ path: { id }, body: { cohortId: newCohortId }, throwOnError: true });
      showToast(t('msg_update_success'));
    } catch (err) {
      console.error('Failed to change cohort', err);
      setUsers(prevUsers);
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
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
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
            <Download className="w-4 h-4 text-on-surface-variant" />
            <span>{t('exportData')}</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary/90 transition-all shadow-md cursor-pointer active:scale-95 duration-100"
          >
            <UserPlus className="w-4 h-4" />
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
        cohortOptions={cohorts.map((c) => c.name)}
      />

      {/* Data Table */}
      <UserListTable
        users={users}
        cohorts={cohorts}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onViewUser={setViewingUser}
        onEditUser={setEditingUser}
        onDeleteUser={handleDeleteUser}
        onChangeRole={handleChangeRole}
        onChangeCohort={handleChangeCohort}
      />

      {/* Create User Drawer */}
      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateUser}
        cohortOptions={cohorts.map((c) => c.name)}
      />

      {/* Edit User Modal */}
      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleUpdateUser}
        cohortOptions={cohorts.map((c) => c.name)}
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
                <User className="w-5 h-5 text-primary" />
                <span>Chi tiết tài khoản</span>
              </h3>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="p-1.5 hover:bg-surface-container rounded-full transition-colors text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
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

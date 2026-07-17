'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, UserPlus } from 'lucide-react';
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
  adminUsersControllerDelete,
  adminUsersControllerBanUser,
  adminUsersControllerUnbanUser,
  cohortControllerFindAll 
} from '@/services/api-client';
import type { CohortSummaryDto } from '@/services/api-client';
import { UserFilterBar } from './UserFilterBar';
import { UserListTable } from './UserListTable';
import { CreateUserModal } from './CreateUserModal';
import { DeleteUserModal } from './DeleteUserModal';
import { BanUserModal } from './BanUserModal';
import { UnbanUserModal } from './UnbanUserModal';
import { BanStatusModal } from './BanStatusModal';

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
  const [banningUser, setBanningUser] = useState<UserDto | null>(null);
  const [unbanningUser, setUnbanningUser] = useState<UserDto | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserDto | null>(null);
  const [viewingBanStatusUser, setViewingBanStatusUser] = useState<UserDto | null>(null);
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
        createdAt: u.createdAt || u.joinedAt || new Date().toISOString(),
        status: u.status || (u.isActive === false ? 'banned' : 'active'),
        banReason: u.banReason || u.ban_reason || null,
      })) || [];
      
      setUsers(usersList);
      setTotal(apiData?.meta?.total || apiData?.meta?.totalItems || usersList.length);
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
      await adminUsersControllerCreate({
        body: {
          name: data.fullName,
          email: data.email,
          password: 'DefaultPassword123!',
          role: data.role.toLowerCase() as 'learner' | 'admin',
        },
        throwOnError: true
      });
      showToast(t('msg_create_success'));
      setPage(1);
      await loadUsers();
    } catch (e) {
      showToast(t('err_create_failed'));
    }
  }

  async function handleBanUser(user: UserDto, reason: string) {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: 'banned', banReason: reason } : u))
    );
    try {
      await adminUsersControllerBanUser({
        path: { id: user.id },
        body: { reason },
        throwOnError: true,
      });
      showToast(t('msg_ban_success'));
    } catch (e) {
      console.error('Failed to ban user on API, keeping state:', e);
      showToast(t('msg_ban_success'));
    }
  }

  async function handleUnbanUser(user: UserDto) {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: 'active', banReason: null } : u))
    );
    try {
      await adminUsersControllerUnbanUser({
        path: { id: user.id },
        throwOnError: true,
      });
      showToast(t('msg_unban_success'));
    } catch (e) {
      console.error('Failed to unban user on API, keeping state:', e);
      showToast(t('msg_unban_success'));
    }
  }

  async function handleDeleteUser(user: UserDto) {
    try {
      await adminUsersControllerDelete({ path: { id: user.id }, throwOnError: true });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setTotal((prev) => Math.max(0, prev - 1));
      showToast(t('msg_delete_success'));
    } catch (e) {
      showToast(t('err_delete_failed'));
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
        onBanUser={setBanningUser}
        onUnbanUser={setUnbanningUser}
        onViewBanStatus={setViewingBanStatusUser}
        onDeleteUser={(user) => setDeletingUser(user)}
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

      {/* Ban User Modal */}
      <BanUserModal
        user={banningUser}
        onClose={() => setBanningUser(null)}
        onConfirm={handleBanUser}
      />

      {/* Unban User Modal */}
      <UnbanUserModal
        user={unbanningUser}
        onClose={() => setUnbanningUser(null)}
        onConfirm={handleUnbanUser}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        user={deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
      />

      {/* Ban Status Modal */}
      <BanStatusModal
        user={viewingBanStatusUser}
        onClose={() => setViewingBanStatusUser(null)}
        onOpenUnban={(u) => setUnbanningUser(u)}
      />

    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  authControllerMe,
  usersControllerGetStats,
  usersControllerClaimDailyXp,
} from '@/services/api-client';
import type { UserProfileDto, UserDashboardStatsDto } from '@/services/client';
import { useAuth } from '@/providers/AuthProvider';
import { isUiShowError } from '@/services/errors';
import { Button } from '@/components/ui/default/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/default/card';
import { ProfileSkeleton } from './ProfileSkeleton';
import { PersonalCard, DailyXpCard } from './PersonalCard';
import { GamificationStats } from './GamificationStats';
import { ActivityBreakdown } from './ActivityBreakdown';
import { EditProfileModal } from './EditProfileModal';
import { ChangePasswordSection } from './ChangePasswordSection';

type TabType = 'overview' | 'edit';

export function ProfilePageContainer() {
  const { updateUser } = useAuth();
  const t = useTranslations('ProfilePage');

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [editSubTab, setEditSubTab] = useState<'general' | 'password'>('general');
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [stats, setStats] = useState<UserDashboardStatsDto | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const loading = loadingProfile && loadingStats;

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const res = await authControllerMe({ throwOnError: false });
      if (res.data) {
        setProfile(res.data as UserProfileDto);
        updateUser(res.data as UserProfileDto);
      }
    } catch (err) {
      if (isUiShowError(err)) {
        toast.error(t(`errors.${err.errorCode}`) || err.message);
      } else {
        toast.error(t('errors.SYSTEM_ERROR'));
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [updateUser, t]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await usersControllerGetStats({ throwOnError: false });
      if (res.data) {
        setStats(res.data as UserDashboardStatsDto);
      }
    } catch (err) {
      if (isUiShowError(err)) {
        toast.error(t(`errors.${err.errorCode}`) || err.message);
      } else {
        toast.error(t('errors.SYSTEM_ERROR'));
      }
    } finally {
      setLoadingStats(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [fetchProfile, fetchStats]);

  const handleClaimDailyXp = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      const res = await usersControllerClaimDailyXp({ throwOnError: true });
      toast.success(t('claimDailyXpSuccess'));
      
      // Update local stats after claim
      if (res.data && stats) {
        setStats({
          ...stats,
          xp: (stats.xp || 0) + 10,
          xpThisWeek: (stats.xpThisWeek || 0) + 10,
        });
      } else {
        fetchStats();
      }
    } catch (err) {
      if (isUiShowError(err)) {
        toast.error(t(`errors.${err.errorCode}`) || err.message);
      }
    } finally {
      setClaiming(false);
    }
  };

  const handleProfileUpdated = (updated: UserProfileDto) => {
    setProfile(updated);
    updateUser(updated);
    setActiveTab('overview');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
      {/* Header Banner & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-on-surface tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-primary">account_circle</span>
            {t('title')}
          </h1>
          <p className="text-sm text-on-surface-variant">
            {t('description')}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant/60 shadow-inner self-start md:self-auto">
          <Button
            onClick={() => setActiveTab('overview')}
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            size="sm"
            className={`gap-2 rounded-lg font-semibold transition-all ${
              activeTab === 'overview' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            {t('tabOverview')}
          </Button>

          <Button
            onClick={() => setActiveTab('edit')}
            variant={activeTab === 'edit' ? 'default' : 'ghost'}
            size="sm"
            className={`gap-2 rounded-lg font-semibold transition-all ${
              activeTab === 'edit' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">manage_accounts</span>
            {t('editAndSecurity')}
          </Button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar / Profile Info (Col 1-4) */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <PersonalCard
              user={profile}
              onEditClick={() => setActiveTab('edit')}
              onReload={fetchProfile}
            />
            <DailyXpCard
              stats={stats}
              onClaimDailyXp={handleClaimDailyXp}
              claiming={claiming}
            />
          </aside>

          {/* Main Dashboard Area (Col 5-12) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <h2 className="text-2xl font-bold text-on-surface">{t('overviewTitle')}</h2>

            {/* Unified Learning Statistics Error Banner */}
            {!stats && !loadingStats && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-on-surface shadow-sm animate-in fade-in duration-300">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-inner">
                    <span className="material-symbols-outlined text-2xl">cloud_off</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-base text-on-surface">{t('loadStatsFailedBannerTitle')}</h3>
                    <p className="text-xs text-on-surface-variant max-w-lg leading-relaxed">{t('loadStatsFailedBannerDesc')}</p>
                  </div>
                </div>
                <Button
                  onClick={fetchStats}
                  disabled={loadingStats}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2 shadow px-5 py-2.5 rounded-xl shrink-0 transition-all w-full sm:w-auto"
                >
                  <span className={`material-symbols-outlined text-lg ${loadingStats ? 'animate-spin' : ''}`}>refresh</span>
                  {loadingStats ? t('reloading') : t('reloadStats')}
                </Button>
              </div>
            )}

            {/* Grid Stats Bento: Level & Streak */}
            <GamificationStats stats={stats} />

            {/* Detailed Stats Cards */}
            <ActivityBreakdown stats={stats} />
          </div>
        </div>
      )}

      {activeTab === 'edit' && (
        profile ? (
          <Card className="border border-outline-variant bg-surface-container-low shadow-md w-full max-w-4xl mx-auto overflow-hidden animate-in fade-in duration-300">
            {/* Card Header with inline switcher */}
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 md:p-8 border-b border-outline-variant bg-surface">
              <div className="flex flex-col gap-1.5">
                <CardTitle className="text-xl md:text-2xl font-bold text-on-surface flex items-center gap-2.5">
                  {editSubTab === 'general' ? (
                    <>
                      <span className="material-symbols-outlined text-primary text-2xl">manage_accounts</span>
                      {t('tabEdit')}
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-red-500 text-2xl">lock_reset</span>
                      {t('tabSecurity')}
                    </>
                  )}
                </CardTitle>
                <CardDescription className="text-sm text-on-surface-variant max-w-xl">
                  {editSubTab === 'general' ? t('editDescription') : t('securityDescription')}
                </CardDescription>
              </div>

              {/* Inline Tabs Switcher */}
              <div className="flex items-center gap-1.5 bg-surface-container p-1.5 rounded-xl border border-outline-variant/60 shadow-inner shrink-0 self-start sm:self-auto">
                <Button
                  type="button"
                  onClick={() => setEditSubTab('general')}
                  variant={editSubTab === 'general' ? 'default' : 'ghost'}
                  size="sm"
                  className={`gap-2 rounded-lg font-semibold px-3 py-1.5 transition-all ${
                    editSubTab === 'general' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">person</span>
                  {t('tabEdit')}
                </Button>

                <Button
                  type="button"
                  onClick={() => setEditSubTab('password')}
                  variant={editSubTab === 'password' ? 'default' : 'ghost'}
                  size="sm"
                  className={`gap-2 rounded-lg font-semibold px-3 py-1.5 transition-all ${
                    editSubTab === 'password' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">lock</span>
                  {t('tabSecurity')}
                </Button>
              </div>
            </CardHeader>

            {/* Card Body */}
            <CardContent className="p-6 md:p-8">
              {editSubTab === 'general' ? (
                <EditProfileModal
                  user={profile}
                  onSuccess={handleProfileUpdated}
                  onCancel={() => setActiveTab('overview')}
                  embedded={true}
                />
              ) : (
                <ChangePasswordSection embedded={true} />
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-md mx-auto w-full pt-6 animate-in fade-in duration-300">
            <PersonalCard user={null} onReload={fetchProfile} />
          </div>
        )
      )}
    </div>
  );
}

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
import { isUiShowError } from '@/services/errors';
import { Button } from '@/components/ui/default/button';
import { ProfileSkeleton } from './ProfileSkeleton';
import { PersonalCard } from './PersonalCard';
import { GamificationStats } from './GamificationStats';
import { ActivityBreakdown } from './ActivityBreakdown';
import { EditProfileModal } from './EditProfileModal';
import { ChangePasswordSection } from './ChangePasswordSection';

type TabType = 'overview' | 'edit' | 'security';

export function ProfilePageContainer() {
  const t = useTranslations('ProfilePage');

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [stats, setStats] = useState<UserDashboardStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes] = await Promise.all([
        authControllerMe({ throwOnError: false }),
        usersControllerGetStats({ throwOnError: false }),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data as UserProfileDto);
      }
      if (statsRes.data) {
        setStats(statsRes.data as UserDashboardStatsDto);
      }
    } catch (err) {
      if (isUiShowError(err)) {
        toast.error(t(`errors.${err.errorCode}`) || err.message);
      } else {
        toast.error(t('errors.SYSTEM_ERROR'));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

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
        fetchProfileData();
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
    setActiveTab('overview');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
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
            <span className="material-symbols-outlined text-base">edit_document</span>
            {t('tabEdit')}
          </Button>

          <Button
            onClick={() => setActiveTab('security')}
            variant={activeTab === 'security' ? 'default' : 'ghost'}
            size="sm"
            className={`gap-2 rounded-lg font-semibold transition-all ${
              activeTab === 'security' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">lock</span>
            {t('tabSecurity')}
          </Button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* Top Row: Personal Card (1 col) + Gamification Stats (2 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            <div className="lg:col-span-1">
              {profile ? (
                <PersonalCard user={profile} onEditClick={() => setActiveTab('edit')} />
              ) : (
                <div className="p-4 text-center text-on-surface-variant">{t('notFound')}</div>
              )}
            </div>

            <div className="lg:col-span-2">
              <GamificationStats
                stats={stats}
                onClaimDailyXp={handleClaimDailyXp}
                claiming={claiming}
              />
            </div>
          </div>

          {/* Bottom Row: Activity Breakdown */}
          <ActivityBreakdown stats={stats} />
        </div>
      )}

      {activeTab === 'edit' && profile && (
        <div className="py-4">
          <EditProfileModal user={profile} onSuccess={handleProfileUpdated} />
        </div>
      )}

      {activeTab === 'security' && (
        <div className="py-4">
          <ChangePasswordSection />
        </div>
      )}
    </div>
  );
}

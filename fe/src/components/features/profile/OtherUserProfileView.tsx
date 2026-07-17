'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/default/badge';
import type { UserProfileDto } from '@/services/client';

export type ExtendedUserProfile = UserProfileDto & {
  isActive?: boolean;
  banReason?: string | null;
  bannedUntil?: string | null;
  lastClaimedXpAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  cohort?: {
    id?: string;
    name?: string;
    targetRampDays?: number;
    isActive?: boolean;
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
  } | null;
};

function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

export function OtherUserProfileView({ profile }: { profile: ExtendedUserProfile | null }) {
  const t = useTranslations('ProfilePage');

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <span className="material-symbols-outlined text-3xl">warning</span>
        </div>
        <div>
          <h3 className="font-bold text-base text-on-surface">{t('loadProfileFailedTitle')}</h3>
          <p className="text-xs text-on-surface-variant mt-1">{t('loadProfileFailedDesc')}</p>
        </div>
      </div>
    );
  }

  const level = profile.level ?? 1;
  const totalXp = profile.xp ?? 0;
  const streakDays = profile.streakDays ?? 0;
  const xpForCurrentTier = totalXp % 500;
  const progressPercent = Math.min(100, Math.round((xpForCurrentTier / 500) * 100));
  const xpNeeded = 500 - xpForCurrentTier;
  const tierNumber = Math.ceil(level / 5);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-on-surface">{t('overviewTitle')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level & XP */}
        <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between md:col-span-2 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t('currentLevel')}
              </span>
              <div className="text-3xl font-black text-on-surface flex items-center gap-2">
                <span>{t('level')} {level}</span>
                <span className="material-symbols-outlined text-primary text-3xl">military_tech</span>
              </div>
            </div>
            <div className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wide">
              &#9733; {t('tier')} {tierNumber}
            </div>
          </div>
          <div className="mt-auto flex flex-col gap-2">
            <div className="flex justify-between text-xs font-semibold text-on-surface-variant mb-1">
              <span>{t('levelProgress', { level: level + 1 })}</span>
              <span className="font-mono text-on-surface">{totalXp.toLocaleString()} XP (+{xpNeeded} {t('nextLevel')})</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-2.5 overflow-hidden border border-outline-variant/40">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3">
            <span className="text-3xl">&#x1F525;</span>
          </div>
          <div className="text-2xl font-black text-on-surface font-mono">{streakDays}</div>
          <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mt-1">
            {t('streakDays')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cohort Info */}
        <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-secondary text-2xl">groups</span>
            <h3 className="font-bold text-base text-on-surface">{t('cohort')}</h3>
          </div>
          {profile.cohort ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">{t('cohortName')}</span>
                <span className="font-semibold text-on-surface">{profile.cohort.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">{t('targetDays')}</span>
                <span className="font-semibold text-on-surface">{profile.cohort.targetRampDays ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">{t('status')}</span>
                <Badge
                  variant="outline"
                  className={profile.cohort.isActive
                    ? 'text-green-600 bg-green-500/10 border-green-500/20 text-xs font-semibold'
                    : 'text-on-surface-variant bg-surface-container-low border-outline-variant text-xs font-semibold'}
                >
                  {profile.cohort.isActive ? t('active') : t('inactive')}
                </Badge>
              </div>
              {'createdAt' in (profile.cohort as object) && (
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">{t('createdAt')}</span>
                  <span className="font-semibold text-on-surface">{formatDate((profile.cohort as Record<string, string | undefined>).createdAt)}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">{t('noCohort')}</p>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-surface rounded-xl border border-outline-variant p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">manage_accounts</span>
            <h3 className="font-bold text-base text-on-surface">{t('accountInfo')}</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">{t('status')}</span>
              <Badge
                variant="outline"
                className={profile.isActive !== false
                  ? 'text-green-600 bg-green-500/10 border-green-500/20 text-xs font-semibold'
                  : 'text-red-600 bg-red-500/10 border-red-500/20 text-xs font-semibold'}
              >
                {profile.isActive !== false ? t('active') : t('banned')}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">{t('role')}</span>
              <Badge
                variant="outline"
                className="text-xs font-semibold uppercase px-2 py-0.5"
              >
                {profile.role?.toLowerCase() === 'admin' ? t('admin') : t('learner')}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">{t('joinedAt')}</span>
              <span className="font-semibold text-on-surface">{formatDate(profile.createdAt || profile.joinedAt)}</span>
            </div>
            {'lastClaimedXpAt' in profile && profile.lastClaimedXpAt && (
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">{t('lastActive')}</span>
                <span className="font-semibold text-on-surface">{formatDate(profile.lastClaimedXpAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

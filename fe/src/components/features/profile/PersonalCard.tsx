'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { UserProfileDto, UserDashboardStatsDto } from '@/services/client';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';

interface PersonalCardProps {
  user: UserProfileDto | null;
  onEditClick?: () => void;
  onReload?: () => void;
}

export function PersonalCard({ user, onEditClick, onReload }: PersonalCardProps) {
  const t = useTranslations('ProfilePage');

  if (!user) {
    return (
      <div className="bg-surface rounded-xl border border-outline-variant p-6 flex flex-col items-center justify-between text-center shadow-sm relative overflow-hidden min-h-[420px] w-full">
        {/* Top Gradient Banner */}
        <div className="absolute top-0 left-0 right-0 w-full h-24 bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 border-b border-outline-variant/30" />

        {/* Large Warning Triangle in upper half */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 my-auto py-8">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
            <span className="material-symbols-outlined text-5xl">warning</span>
          </div>
          <div className="flex flex-col gap-1.5 max-w-xs">
            <h3 className="font-bold text-base text-on-surface">{t('loadProfileFailedTitle')}</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">{t('loadProfileFailedDesc')}</p>
          </div>
        </div>

        {/* Reload Button at bottom */}
        {onReload && (
          <div className="w-full pt-4 border-t border-outline-variant relative z-10">
            <Button
              onClick={onReload}
              className="w-full bg-primary text-on-primary hover:bg-primary/90 transition-all py-2.5 px-4 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              {t('reload')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  const hue = user.avatarHue ?? 210;
  const avatarStyle = {
    backgroundColor: `hsl(${hue}, 70%, 50%)`,
    color: '#ffffff',
  };

  const formattedDate = user.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'N/A';

  const isRoleAdmin = user.role?.toLowerCase() === 'admin';
  const roleLabel = isRoleAdmin ? t('admin') : t('learner');

  return (
    <div className="bg-surface rounded-xl border border-outline-variant p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
      {/* Top Gradient Banner */}
      <div className="absolute top-0 left-0 right-0 w-full h-24 bg-gradient-to-r from-primary/20 via-purple-500/20 to-secondary/20 border-b border-outline-variant/30" />

      {/* Dynamic Avatar */}
      <div
        style={avatarStyle}
        className="relative z-10 w-24 h-24 rounded-full border-4 border-surface shadow-md flex items-center justify-center font-bold text-3xl mb-4 mt-6 shrink-0 transition-transform hover:scale-105 duration-300"
      >
        {initial}
      </div>

      {/* User Info */}
      <h1 className="text-2xl font-bold text-on-surface mb-1 truncate max-w-full">
        {user.name || t('anonymousLearner')}
      </h1>
      <p className="text-sm text-on-surface-variant truncate mb-1 max-w-full" title={user.email || ''}>
        {user.email || 'N/A'}
      </p>
      
      <div className="flex items-center justify-center mb-4">
        <Badge
          variant= 'outline'
          className="text-xs font-semibold uppercase px-2.5 py-0.5"
        >
          {roleLabel}
        </Badge>
      </div>

      

      {/* Bio / Short Description */}
      {user.title ? (
        <div className="text-sm text-on-surface font-normal mb-6 px-3 py-3  rounded-xl  w-full italic break-words flex items-center justify-center text-center">
          &quot;{user.title}&quot;
        </div>
      ) : (
        <div className="text-sm text-on-surface-variant/70 font-normal mb-6 px-3 py-3 bg-surface-container-lowest/50 rounded-xl border border-dashed border-outline-variant/50 w-full italic break-words shadow-2xs min-h-[72px] flex items-center justify-center text-center">
          {t('noBio')}
        </div>
      )}

      {/* Join Date & Cohort (No border separator) */}
      <div className="w-full flex flex-col gap-2 text-on-surface-variant text-xs mb-6 justify-center">
        <div className="flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
          <span>{t('joinedAt')}: <strong className="text-on-surface">{formattedDate}</strong></span>
        </div>
        {user.cohortId && (
          <div className="flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-secondary">groups</span>
            <span>{t('cohort')}: <strong className="text-on-surface font-mono">{user.cohortId}</strong></span>
          </div>
        )}
      </div>

      {/* Edit Button */}
      {onEditClick && (
        <Button
          onClick={onEditClick}
          variant="outline"
          className="w-full bg-surface text-primary border-primary/50 hover:bg-primary/10 transition-colors py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          {t('tabEdit')}
        </Button>
      )}
    </div>
  );
}

interface DailyXpCardProps {
  stats: UserDashboardStatsDto | null;
  onClaimDailyXp?: () => Promise<void>;
  claiming?: boolean;
  claimedToday?: boolean;
}

export function DailyXpCard({ stats, onClaimDailyXp, claiming = false, claimedToday = false }: DailyXpCardProps) {
  const t = useTranslations('ProfilePage');

  if (!stats) {
    return (
      <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-6 text-on-surface relative overflow-hidden shadow-2xs flex flex-col justify-center items-center text-center min-h-[160px]">
        <div className="flex flex-col items-center gap-2 text-amber-500">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">error_outline</span>
          </div>
          <h3 className="font-bold text-sm text-on-surface">{t('loadRewardFailed')}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-on-surface relative overflow-hidden shadow-sm">
      <div className="absolute -right-4 -top-4 opacity-15 pointer-events-none text-primary">
        <span className="material-symbols-outlined text-[120px]">stars</span>
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-500 text-2xl">workspace_premium</span>
          <h3 className="font-bold text-lg text-on-surface">{t('dailyReward')}</h3>
        </div>
        <p className="text-sm text-on-surface-variant">
          {claimedToday ? t('comeBackTomorrow') : t('dailyRewardDesc', { xp: 50 })}
        </p>
        <Button
          onClick={onClaimDailyXp}
          disabled={claiming || claimedToday}
          className="bg-primary text-on-primary hover:bg-primary/90 transition-colors py-2 px-4 rounded-lg font-semibold w-full shadow-sm mt-1 disabled:bg-surface-container-low disabled:text-on-surface-variant disabled:shadow-none"
        >
          {claiming ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
              {t('claimDailyXp')}...
            </span>
          ) : claimedToday ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {t('claimedToday')}
            </span>
          ) : (
            t('claimDailyXp')
          )}
        </Button>
      </div>
    </div>
  );
}

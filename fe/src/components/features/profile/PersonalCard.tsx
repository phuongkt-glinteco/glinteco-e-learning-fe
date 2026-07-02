'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { UserProfileDto } from '@/services/client';
import { Card, CardContent } from '@/components/ui/default/card';
import { Badge } from '@/components/ui/default/badge';
import { Button } from '@/components/ui/default/button';

interface PersonalCardProps {
  user: UserProfileDto;
  onEditClick?: () => void;
}

export function PersonalCard({ user, onEditClick }: PersonalCardProps) {
  const t = useTranslations('ProfilePage');

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
    <Card className="border border-outline-variant bg-surface-container-low shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="h-24 w-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border-b border-outline-variant/30" />
      
      <CardContent className="p-6 -mt-12 flex flex-col items-center text-center gap-4">
        {/* Dynamic Avatar */}
        <div
          style={avatarStyle}
          className="w-24 h-24 rounded-full border-4 border-surface shadow-md flex items-center justify-center font-bold text-3xl shrink-0 transition-transform hover:scale-105 duration-300"
        >
          {initial}
        </div>

        {/* User Info */}
        <div className="flex flex-col items-center gap-1 w-full">
          <div className="flex items-center gap-2 justify-center flex-wrap">
            <h2 className="text-xl font-bold text-on-surface truncate max-w-[200px]">
              {user.name || t('anonymousLearner')}
            </h2>
            <Badge
              variant={isRoleAdmin ? 'default' : 'secondary'}
              className="text-xs font-semibold uppercase px-2.5 py-0.5"
            >
              {roleLabel}
            </Badge>
          </div>
          <p className="text-sm text-on-surface-variant font-medium truncate max-w-full">
            {user.title || t('learner')}
          </p>
        </div>

        {/* Details List */}
        <div className="w-full flex flex-col gap-2.5 border-t border-outline-variant pt-4 mt-1 text-sm">
          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">mail</span>
              {t('email')}
            </span>
            <span className="font-medium text-on-surface truncate max-w-[160px]" title={user.email || ''}>
              {user.email || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between items-center text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">calendar_today</span>
              {t('joinedAt')}
            </span>
            <span className="font-medium text-on-surface">
              {formattedDate}
            </span>
          </div>

          {user.cohortId && (
            <div className="flex justify-between items-center text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">groups</span>
                {t('cohort')}
              </span>
              <Badge variant="outline" className="font-mono text-xs">
                {user.cohortId}
              </Badge>
            </div>
          )}
        </div>

        {/* Edit Button */}
        {onEditClick && (
          <Button
            onClick={onEditClick}
            variant="outline"
            className="w-full mt-2 gap-2 border-primary/40 hover:bg-primary/10 text-primary font-medium"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            {t('tabEdit')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

interface UserProfileAvatarProps {
  size?: 'sm' | 'lg';
  showDetails?: boolean;
  name?: string;
  role?: string;
  imageUrl?: string;
  hue?: number;
  className?: string;
}

export default function UserProfileAvatar({
  size = 'sm',
  showDetails = false,
  name,
  role,
  imageUrl,
  hue,
  className = '',
}: UserProfileAvatarProps) {
  const { user } = useAuth();
  const t = useTranslations('AppShell');
  const isLarge = size === 'lg';

  const displayName = name || user?.name || 'Learner';
  const rawRole = role || user?.title || user?.role || 'Learner';
  const displayRole = rawRole === 'Backend Engineer' ? t('role') : rawRole;
  const displayHue = hue ?? user?.avatarHue ?? 210;
  const initial = displayName.charAt(0).toUpperCase();
  const router = useRouter();

  const avatarCircle = (
    <div
      style={!imageUrl ? { backgroundColor: `hsl(${displayHue}, 70%, 50%)`, color: '#ffffff' } : undefined}
      className={`${
        isLarge ? 'h-16 w-16 text-2xl font-bold' : 'h-8 w-8 text-sm font-semibold'
      } bg-surface-container rounded-full border border-outline-variant flex items-center justify-center shrink-0 overflow-hidden ${showDetails ? '' : className}`}
    >
      {imageUrl ? (
        <Image
          alt={displayName}
          className="w-full h-full rounded-full object-cover"
          src={imageUrl}
          width={isLarge ? 64 : 32}
          height={isLarge ? 64 : 32}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );

  if (showDetails) {
    return (
      <div className={`flex items-center gap-md pb-lg border-b border-outline-variant w-full ${className}`}>
        {avatarCircle}
        <div onClick={() => router.push('/profile')} className="flex flex-col gap-1 cursor-pointer">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{displayName}</h2>
          <p className="font-body-sm text-sm text-on-surface-variant font-medium">{displayRole}</p>
        </div>
      </div>
    );
  }

  return avatarCircle;
}


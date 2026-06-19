'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import {useRouter} from 'next/navigation';

interface UserProfileAvatarProps {
  size?: 'sm' | 'lg';
  showDetails?: boolean;
  name?: string;
  role?: string;
  imageUrl?: string;
  className?: string;
}

export default function UserProfileAvatar({
  size = 'sm',
  showDetails = false,
  name = 'Alex',
  role = 'Backend Engineer',
  imageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVfE1-ZnknMx9M00RSW3dBZN6QOl1IUj3zuw0jRZtNQNuJrkqUerogGX5eMSz7anZFjH2OlECuOs1TxlbExlhnUC-7UZWtA5Es0CDfXf7zxUsFdELRUwyKk_zPGnnGrOw8Z3doFeIq6k2tgCIQTy60Dba0PTv-eOFx6rsPHmOJ7g_YcGmpHkwsWSwtt__hsnt3UIv74cqZsFzIhRp64pnF02z4NsypUMZODNqkzpvfUFnDc2KsCA0TT4zTh_ANDa2K_B_pQr0yizI',
  className = '',
}: UserProfileAvatarProps) {
  const t = useTranslations('AppShell');
  const isLarge = size === 'lg';

  const displayRole = role === 'Backend Engineer' ? t('role') : role;
  const router = useRouter();

  const avatarCircle = (
    <div
      className={`${
        isLarge ? 'h-16 w-16' : 'h-8 w-8'
      } bg-surface-container rounded-full border border-outline-variant flex items-center justify-center shrink-0 overflow-hidden ${showDetails ? '' : className}`}
    >
      {imageUrl ? (
        <Image
          alt={name}
          className="w-full h-full rounded-full object-cover"
          src={imageUrl}
          width={isLarge ? 64 : 32}
          height={isLarge ? 64 : 32}
        />
      ) : (
        <span className={`material-symbols-outlined text-on-surface-variant ${isLarge ? 'text-2xl' : 'text-sm'}`}>
          person
        </span>
      )}
    </div>
  );

  if (showDetails) {
    return (
      <div className={`flex items-center gap-md pb-lg border-b border-outline-variant w-full ${className}`}>
        {avatarCircle}
        <div onClick={() => router.push('/profile')} className="flex flex-col gap-1 cursor-pointer">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{name}</h2>
          <p className="font-body-sm text-sm text-on-surface-variant font-medium">{displayRole}</p>
        </div>
      </div>
    );
  }

  return avatarCircle;
}


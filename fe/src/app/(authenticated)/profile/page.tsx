'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageContainer } from '@/components/ui';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import { ProfilePageContainer } from '@/components/features/profile';

export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  const { setTree } = useBreadcrumbStore();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id') || undefined;

  useEffect(() => {
    setTree([{ label: t('title', { defaultValue: 'Profile' }), href: '/profile' }]);
  }, [setTree]);

  return (
    <PageContainer scrollable>
      <ProfilePageContainer userId={userId} />
    </PageContainer>
  );
}

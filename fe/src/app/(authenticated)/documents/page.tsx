'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import DocumentsContainer from '@/components/features/documents/DocumentsContainer';
import { PageContainer, PageHeader } from '@/components/ui';
import { useBreadcrumbStore } from '@/stores/breadcrumbStore';
import { useEffect } from 'react';

export default function DocumentsPage() {
  const t = useTranslations('DocumentsPage');
  const { setTree } = useBreadcrumbStore();

  useEffect(() => {
    setTree([{ label: t('title', { defaultValue: 'Documents' }), href: '/documents' }]);
  }, [setTree]);

  return (
    <PageContainer scrollable>
      <PageHeader 
        title={t('title')} 
        description={t('description')}
      />
      <DocumentsContainer />
    </PageContainer>
  );
}

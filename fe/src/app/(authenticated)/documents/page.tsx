'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import DocumentsContainer from '@/components/features/documents/DocumentsContainer';
import { PageContainer, PageHeader } from '@/components/ui';

export default function DocumentsPage() {
  const t = useTranslations('DocumentsPage');

  return (
    <PageContainer scrollable>
      <PageHeader 
        title={t('title')} 
        description={t('description')}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Documents' }
        ]}
      />
      <DocumentsContainer />
    </PageContainer>
  );
}

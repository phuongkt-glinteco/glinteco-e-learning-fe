'use client';

import { useTranslations } from 'next-intl';
import DocumentsContainer from '@/components/features/documents/DocumentsContainer';

export default function DocumentsPage() {
  const t = useTranslations('DocumentsPage');

  return (
    <div className="py-lg">
      <div className="px-gutter max-w-container-max mx-auto w-full">
        <header className="mb-xl">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm">{t('title')}</h1>
          <p className="text-body-lg text-on-surface-variant">{t('description')}</p>
        </header>
      </div>
      <DocumentsContainer />
    </div>
  );
}

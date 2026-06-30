'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

function ErrorPageContent() {
  const t = useTranslations('ErrorPage');
  const searchParams = useSearchParams();
  const code = searchParams.get('code') || 'UNKNOWN_ERROR';
  const message = searchParams.get('message') || t('defaultMessage');

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/logo.png"
            alt="RAMP UP Logo"
            width={64}
            height={64}
            className="rounded-xl shadow-md border border-outline"
            priority
          />
        </div>

        <div className="mb-6 flex justify-center">
          <span className="material-symbols-outlined text-6xl text-error">
            error
          </span>
        </div>

        <h1 className="text-2xl font-bold text-on-surface mb-2">
          {t('title')}
        </h1>

        <p className="text-sm text-on-surface-variant mb-6">
          {message}
        </p>

        {code !== 'UNKNOWN_ERROR' && (
          <p className="text-xs text-outline mb-6">
            {t('errorCode')}: {code}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            {t('goHome')}
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-surface text-on-surface text-sm font-medium rounded-lg border border-outline hover:bg-surface-container transition-colors"
          >
            {t('goToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorPageContent />
    </Suspense>
  );
}

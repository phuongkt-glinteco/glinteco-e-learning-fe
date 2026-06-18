import './globals.css';
import { getLocale } from 'next-intl/server';
import { LanguageProvider } from '@/providers/LanguageProvider';
import { ApiErrorProvider } from '@/providers/ApiErrorProvider';
import { ApiErrorContainer } from '@/components/ui/ApiErrorContainer';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'RAMP UP',
  description: 'Level up your engineering journey.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/logo.png" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider initialLocale={locale}>
          <ApiErrorProvider>
            {children}
            <ApiErrorContainer />
          </ApiErrorProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

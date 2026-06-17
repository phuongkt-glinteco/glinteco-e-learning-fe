import { getLocale } from 'next-intl/server';
import { LanguageProvider } from '@/providers/LanguageProvider';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'RAMP UP',
  description: 'Level up your engineering journey.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider initialLocale={locale}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

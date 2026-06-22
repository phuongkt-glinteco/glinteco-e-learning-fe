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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider initialLocale={locale}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

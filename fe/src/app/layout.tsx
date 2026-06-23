import './globals.css';
import { getLocale } from 'next-intl/server';
import { LanguageProvider } from '@/providers/LanguageProvider';
import { ApiErrorProvider } from '@/providers/ApiErrorProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import SessionProvider from '@/providers/SessionProvider';
import { ApiErrorContainer } from '@/components/ui/containers/ApiErrorContainer';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'RAMP UP',
  description: 'Level up your engineering journey.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        <SessionProvider>
          <LanguageProvider initialLocale={locale}>
            <ApiErrorProvider>
              <AuthProvider>
                {children}
                <ApiErrorContainer />
              </AuthProvider>
            </ApiErrorProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
import './globals.css';
import { getLocale, getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { LanguageProvider } from '@/providers/LanguageProvider';
import { ApiErrorProvider } from '@/providers/ApiErrorProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import SessionProvider from '@/providers/SessionProvider';
import { ApiErrorContainer } from '@/components/ui/containers/ApiErrorContainer';
import { TooltipProvider } from '@/components/ui/default/tooltip';
import { Toaster } from '@/components/ui/default/sonner';
import type { ReactNode } from 'react';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: 'RAMP UP',
  description: 'Level up your engineering journey.',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={cn("font-sans", geist.variable)}>
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
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SessionProvider>
            <LanguageProvider initialLocale={locale}>
              <TooltipProvider>
                <ApiErrorProvider>
                  <AuthProvider>
                    {children}
                    <ApiErrorContainer />
                    <Toaster position="bottom-right" richColors closeButton expand />
                  </AuthProvider>
                </ApiErrorProvider>
              </TooltipProvider>
            </LanguageProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
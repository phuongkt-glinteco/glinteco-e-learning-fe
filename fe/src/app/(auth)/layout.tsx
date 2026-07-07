import { ReactNode } from 'react';
import { AuthLayout } from '@/components/features/auth/AuthLayout';

export default function AuthRootLayout({ children }: { children: ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}

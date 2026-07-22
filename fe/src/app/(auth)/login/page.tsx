import { Suspense } from 'react';
import LoginPage from '@/components/features/auth/LoginPage';
import LoadingPage from '@/components/ui/loading/LoadingPage';

export default function Login() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <LoginPage />
    </Suspense>
  );
}

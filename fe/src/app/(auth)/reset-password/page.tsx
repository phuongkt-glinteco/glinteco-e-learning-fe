import { Suspense } from 'react';
import ResetPasswordPage from '@/components/features/auth/ResetPasswordPage';
import LoadingPage from '@/components/ui/loading/LoadingPage';

export default function ResetPassword() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <ResetPasswordPage />
    </Suspense>
  );
}

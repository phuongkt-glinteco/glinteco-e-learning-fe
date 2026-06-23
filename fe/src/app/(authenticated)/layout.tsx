import { Suspense } from 'react';
import FeatureLayout from '@/components/layout/FeatureLayout';
import LoadingPage from '@/components/ui/loading/LoadingPage';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <FeatureLayout>
      <Suspense fallback={<LoadingPage />}>{children}</Suspense>
    </FeatureLayout>
  );
}

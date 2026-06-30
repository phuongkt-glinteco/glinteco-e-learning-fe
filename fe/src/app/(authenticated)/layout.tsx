import FeatureLayout from '@/components/layout/FeatureLayout';
import LoadingPage from '@/components/ui/loading/LoadingPage';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <FeatureLayout>
      {children}
    </FeatureLayout>
  );
}

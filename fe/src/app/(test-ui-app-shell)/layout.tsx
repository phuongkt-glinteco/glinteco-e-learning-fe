import FeatureLayout from '@/components/layout/FeatureLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <FeatureLayout>
      {children}
    </FeatureLayout>
  );
}
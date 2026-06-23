'use client';

import Skeleton from '@/components/ui/loading/Skeleton';
import WelcomeSection from './WelcomeSection';
import StatsGrid from './StatsGrid';
import ContinueLearningSection from './ContinueLearningSection';
import LearningActivitySection from './LearningActivitySection';
import RecentDocumentsSection from './RecentDocumentsSection';

export default function LearnerDashboardPage() {
  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-lg p-16">
      <WelcomeSection />
      <StatsGrid />
      <div className="flex flex-col gap-lg">
        <ContinueLearningSection />
        <LearningActivitySection />
        <RecentDocumentsSection />
      </div>
      <div className="h-8" />
    </div>
  );
}

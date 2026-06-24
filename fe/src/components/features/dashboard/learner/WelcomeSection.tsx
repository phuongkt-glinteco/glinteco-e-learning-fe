'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/AuthProvider';
import SectionHead from '@/components/ui/SectionHead'

export default function WelcomeSection() {
  const t = useTranslations('LearnerDashboard');
  const { user } = useAuth();

  return (
    <section className="flex flex-col gap-1">
      <SectionHead
        title={t('welcomeTitle', { name: user?.name ?? 'Learner' })}
      />
      <p className="text-body-md text-on-surface-variant">
        {user?.title ?? 'Engineer'} &mdash; Cohort #{user?.cohortId ?? ''}
      </p>
    </section>
  );
}

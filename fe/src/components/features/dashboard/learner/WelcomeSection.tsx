'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/AuthProvider';
import type { UserDetail } from '@/services/api-client';

function truncateId(id: string): string {
  if (id.length <= 6) return id;
  return `${id.slice(0, 3)}...${id.slice(-3)}`;
}

export default function WelcomeSection() {
  const t = useTranslations('LearnerDashboard');
  const { user } = useAuth();
  const cohortDisplay = (user as UserDetail)?.cohortId ? truncateId((user as UserDetail).cohortId ?? '') : '';

  return (
    <section className="flex flex-col gap-1">
      <h2 className="text-headline-lg-mobile md:text-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-bold">
        {t('welcomeTitle', { name: user?.name ?? 'Learner' })}
      </h2>
      <p className="text-body-md text-on-surface-variant">
        {(user as UserDetail)?.title ?? 'Engineer'} &mdash; Cohort #{cohortDisplay}
      </p>
    </section>
  );
}

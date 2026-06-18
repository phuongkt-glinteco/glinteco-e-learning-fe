interface WelcomeSectionProps {
  name: string;
  title: string;
  cohortId: string | number;
}

export default function WelcomeSection({ name, title, cohortId }: WelcomeSectionProps) {
  return (
    <section className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
          Hi {name},
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
          {title} (Cohort #{cohortId}) &mdash; Let&apos;s continue ramping up.
        </p>
      </div>
    </section>
  );
}

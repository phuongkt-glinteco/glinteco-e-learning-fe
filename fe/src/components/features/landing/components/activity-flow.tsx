import type { ActivityFlowStep, SectionIntro } from '../types';

type ActivityFlowProps = {
  intro: SectionIntro;
  stepLabel: (stepNumber: number) => string;
  steps: ActivityFlowStep[];
};

const flowToneClasses = [
  'bg-[#eff6ff] text-[#2563eb]',
  'bg-[#ecfdf5] text-[#007f36]',
  'bg-[#fff7ed] text-[#f97316]',
  'bg-[#faf5ff] text-[#7c3aed]',
] as const;

export function ActivityFlow({ intro, stepLabel, steps }: ActivityFlowProps) {
  return (
    <section id="how-it-works" className="bg-white px-4 py-20 md:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="mx-auto max-w-[640px] text-center">
          <p className="text-[13px] font-semibold uppercase leading-5 tracking-[0.08em] text-[#2563eb]">
            {intro.eyebrow}
          </p>
          <h2 className="mt-2 text-[24px] font-semibold leading-8 tracking-[0] text-[#0b1c30]">
            {intro.title}
          </h2>
          {intro.description ? (
            <p className="mt-3 text-[14px] leading-6 tracking-[0] text-[#475569]">
              {intro.description}
            </p>
          ) : null}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <article
              key={step.id}
              className="rounded-[12px] border border-[#dbe3ef] bg-[#f8fafc] p-5"
            >
              <span
                aria-hidden="true"
                className={[
                  'grid h-10 w-10 place-items-center rounded-[8px]',
                  flowToneClasses[index % flowToneClasses.length],
                ].join(' ')}
              >
                <span className="material-symbols-outlined block translate-y-px text-[22px] leading-none">
                  {step.iconName}
                </span>
              </span>
              <p className="mt-5 text-[12px] font-semibold uppercase leading-4 tracking-[0.08em] text-[#64748b]">
                {stepLabel(index + 1)}
              </p>
              <h3 className="mt-2 text-[16px] font-semibold leading-6 tracking-[0] text-[#0b1c30]">
                {step.title}
              </h3>
              <p className="mt-2 text-[14px] leading-6 tracking-[0] text-[#475569]">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

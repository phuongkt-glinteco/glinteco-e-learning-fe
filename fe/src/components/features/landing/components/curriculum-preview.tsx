import type { CurriculumStage, SectionIntro } from '../types';

type CurriculumPreviewProps = {
  intro: SectionIntro;
  stages: CurriculumStage[];
};

const stageToneClasses = [
  'bg-[#eff6ff] text-[#2563eb]',
  'bg-[#faf5ff] text-[#7c3aed]',
  'bg-[#ecfdf5] text-[#007f36]',
] as const;

export function CurriculumPreview({ intro, stages }: CurriculumPreviewProps) {
  return (
    <section id="features" className="border-y border-[#dbe3ef] bg-[#f2f3ff]/90 px-4 py-20 md:px-10">
      <div className="mx-auto max-w-[1280px]">
        <div className="mx-auto max-w-[680px] text-center">
          <p className="text-[13px] font-semibold uppercase leading-5 tracking-[0.08em] text-[#2563eb]">
            {intro.eyebrow}
          </p>
          <h2 className="mt-2 text-[24px] font-semibold leading-8 tracking-[0] text-[#131b2e]">
            {intro.title}
          </h2>
          {intro.description ? (
            <p className="mt-3 text-[14px] leading-6 tracking-[0] text-[#434655]">
              {intro.description}
            </p>
          ) : null}
        </div>

        <div className="mt-10 grid gap-7 md:grid-cols-3">
          {stages.map((stage, index) => (
            <article
              key={stage.id}
              className="rounded-[8px] border border-[#dbe3ef] bg-white p-6 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_16px_-14px_rgba(15,23,42,0.24)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  aria-hidden="true"
                  className={[
                    'grid h-10 w-10 place-items-center rounded-[8px]',
                    stageToneClasses[index % stageToneClasses.length],
                  ].join(' ')}
                >
                  <span className="material-symbols-outlined block translate-y-px text-[22px] leading-none">
                    {stage.iconName}
                  </span>
                </span>
                <span className="rounded-[4px] border border-[#dbe3ef] bg-[#faf8ff] px-2 py-1 text-[12px] font-semibold leading-4 text-[#434655]">
                  {stage.duration}
                </span>
              </div>

              <p className="mt-6 text-[12px] font-semibold uppercase leading-4 tracking-[0.08em] text-[#2563eb]">
                {stage.eyebrow}
              </p>
              <h3 className="mt-2 text-[16px] font-semibold leading-6 tracking-[0] text-[#131b2e]">
                {stage.title}
              </h3>
              <p className="mt-3 text-[14px] leading-6 tracking-[0] text-[#334155]">
                {stage.description}
              </p>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] font-semibold leading-4 text-[#434655]">
                    {stage.statusLabel}
                  </span>
                  <span className="text-[12px] font-semibold leading-4 text-[#434655]">
                    {stage.progressPercent}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f1f5f9]">
                  <div
                    className="h-full rounded-full bg-[#2563eb]"
                    style={{ width: `${stage.progressPercent}%` }}
                  />
                </div>
              </div>

              <ul className="mt-5 space-y-2">
                {stage.modules.map((module) => (
                  <li
                    key={module}
                    className="flex items-center gap-2 text-[13px] leading-5 text-[#434655]"
                  >
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-[16px] leading-none text-[#007f36]"
                    >
                      check_circle
                    </span>
                    <span>{module}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

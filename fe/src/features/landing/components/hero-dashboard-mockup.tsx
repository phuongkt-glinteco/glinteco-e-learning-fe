import type { DashboardPreview } from '../types';

type HeroDashboardMockupProps = {
  preview: DashboardPreview;
};

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex min-h-6 items-center rounded-[4px] bg-[#eff6ff] px-2 text-[12px] font-semibold leading-4 tracking-[0] text-[#2563eb]">
      {label}
    </span>
  );
}

export function HeroDashboardMockup({ preview }: HeroDashboardMockupProps) {
  const progressPercent = Number.isFinite(preview.progressPercent)
    ? Math.min(100, Math.max(0, preview.progressPercent))
    : 0;
  const xpRingPercent = 72;

  return (
    <div
      className="landing-dashboard-preview min-w-0 overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-white/90 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_10px_15px_-3px_rgba(15,23,42,0.05)] backdrop-blur md:p-6 lg:ml-auto"
      aria-label={preview.ariaLabel}
    >
      <div className="flex flex-col gap-4 border-b border-[#e2e8f0] pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e2e7ff] text-[14px] font-semibold leading-5 text-[#2563eb]">
            {preview.learnerInitials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-5 text-[#131b2e]">
              {preview.learnerName}
            </p>
            <p className="mt-1 truncate text-[14px] leading-5 text-[#434655]">
              {preview.learnerRole}
            </p>
          </div>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-3 sm:w-[184px]">
          <div className="min-w-0 rounded-[8px] border border-[#e2e8f0] bg-[#faf8ff] px-3 py-2">
            <p className="text-[12px] font-semibold leading-4 tracking-[0] text-[#434655]">
              {preview.levelTitle}
            </p>
            <p className="mt-1 text-[13px] font-semibold leading-5 text-[#7c3aed]">
              {preview.levelLabel}
            </p>
          </div>
          <div className="min-w-0 rounded-[8px] border border-[#e2e8f0] bg-[#faf8ff] px-3 py-2">
            <p className="text-[12px] font-semibold leading-4 tracking-[0] text-[#434655]">
              {preview.streakTitle}
            </p>
            <p className="mt-1 text-[13px] font-semibold leading-5 text-[#007f36]">
              {preview.streakLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-[minmax(0,1fr)_136px]">
        <div className="min-w-0 rounded-[8px] border border-[#e2e8f0] bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="min-w-0 truncate text-[14px] font-semibold leading-5 text-[#131b2e]">
              {preview.activeTrack}
            </p>
            <p className="shrink-0 text-[14px] font-semibold leading-5 text-[#434655]">
              {progressPercent}%
            </p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#f1f5f9]">
            <div
              className="h-full rounded-full bg-[#2563eb]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-3 text-[13px] leading-5 text-[#434655]">
            {preview.activeTrackLabel}
          </p>
        </div>

        <div className="grid min-w-0 place-items-center rounded-[8px] border border-[#e2e8f0] bg-[#faf8ff] p-4">
          <div
            className="grid h-20 w-20 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#7c3aed ${xpRingPercent}%, #eaddff 0)`,
            }}
          >
            <div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-white text-center">
              <div>
                <p className="text-[13px] font-semibold leading-4 text-[#7c3aed]">
                  {preview.xpLabel}
                </p>
                <p className="mt-1 text-[11px] font-semibold leading-4 text-[#434655]">
                  {preview.xpTitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid min-w-0 gap-3 rounded-[8px] border border-[#e2e8f0] bg-[#f8fafc] px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-[23px] leading-none text-[#2563eb]"
        >
          rate_review
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold leading-5 text-[#131b2e]">
            {preview.reviewItem.title}
          </p>
          <p className="mt-1 truncate text-[14px] leading-5 text-[#434655]">
            {preview.reviewItem.subtitle}
          </p>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
          <span className="rounded-[4px] border border-[#e2e8f0] bg-white px-2 py-1 text-[12px] font-semibold leading-4 text-[#434655]">
            {preview.reviewItem.tag}
          </span>
          <StatusBadge label={preview.reviewItem.statusLabel} />
        </div>
      </div>
    </div>
  );
}

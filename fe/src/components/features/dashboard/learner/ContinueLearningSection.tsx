import { ProgressBar } from '@/components/ui/HPBar';

interface ContinueLearningSectionProps {
  moduleLabel: string;
  timeLeft: string;
  title: string;
  description: string;
  progress: number;
  icon?: string;
  onContinue?: () => void;
  onViewPath?: () => void;
}

export default function ContinueLearningSection({
  moduleLabel,
  timeLeft,
  title,
  description,
  progress,
  icon = 'data_object',
  onContinue,
  onViewPath,
}: ContinueLearningSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">Continue Learning</h3>
        {onViewPath && (
          <button
            onClick={onViewPath}
            className="font-label-sm text-label-sm text-primary hover:opacity-80 transition-opacity flex items-center cursor-pointer"
          >
            View Path
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        )}
      </div>
      <div className="bg-white border-2 border-primary rounded-xl p-lg flex flex-col md:flex-row gap-lg md:items-center relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        <div className="w-20 h-20 bg-primary-container/10 rounded-xl flex flex-shrink-0 items-center justify-center border border-primary/20 z-10">
          <span className="material-symbols-outlined text-[40px] text-primary">{icon}</span>
        </div>
        <div className="flex-1 flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-primary text-white font-label-sm text-[10px] uppercase tracking-wider rounded">
              {moduleLabel}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {timeLeft}
            </span>
          </div>
          <h4 className="font-headline-md text-headline-md text-on-surface">{title}</h4>
          <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 max-w-2xl">
            {description}
          </p>
          <div className="mt-4 flex flex-col gap-2 max-w-md">
            <div className="flex justify-between items-center font-label-sm text-label-sm">
              <span className="text-on-surface-variant">Lesson Progress</span>
              <span className="text-primary font-bold">{progress}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        </div>
        <div className="mt-4 md:mt-0 z-10">
          <button
            onClick={onContinue}
            className="w-full md:w-auto bg-primary text-white font-label-md text-label-md px-8 py-4 rounded-lg hover:opacity-90 transition-all whitespace-nowrap shadow-md active:scale-95 cursor-pointer"
          >
            Continue Lesson
          </button>
        </div>
      </div>
    </section>
  );
}

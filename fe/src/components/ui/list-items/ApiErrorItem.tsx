'use client';

interface ApiErrorItemProps {
  title?: string;
  message: string;
  onClose?: () => void;
}

export function ApiErrorItem({ title, message, onClose }: ApiErrorItemProps) {
  return (
    <div
      className="relative overflow-hidden flex gap-3 p-4 rounded-xl border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-red-200/50 dark:border-red-950/30 shadow-md hover:shadow-lg transition-all duration-300 hover:translate-x-[-2px] animate-in slide-in-from-right fade-in duration-300"
      role="alert"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 dark:bg-red-600" />

      <div className="flex-shrink-0 text-red-500 dark:text-red-400 mt-0.5">
        <span className="material-symbols-outlined select-none text-xl leading-none">
          error
        </span>
      </div>

      <div className="flex-1 pr-6 select-text">
        {title && (
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-normal mb-0.5">
            {title}
          </h4>
        )}
        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-normal font-normal">
          {message}
        </p>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-[16px] select-none leading-none">
            close
          </span>
        </button>
      )}
    </div>
  );
}

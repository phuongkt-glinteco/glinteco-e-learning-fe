interface HPBarProps {
  value: number;
  segments?: number;
  warn?: boolean;
}

export default function HPBar({ value, segments = 20, warn = false }: HPBarProps) {
  const filled = Math.round((value / 100) * segments);
  return (
    <div className="flex gap-0.5 w-full bg-slate-100 p-0.5 rounded-md border border-slate-200">
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className={`h-3.5 flex-1 transition-all duration-300 first:rounded-l last:rounded-r ${
            i < filled
              ? warn
                ? 'bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.2)]'
                : 'bg-[#2563EB] shadow-[0_0_4px_rgba(37,99,235,0.2)]'
              : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

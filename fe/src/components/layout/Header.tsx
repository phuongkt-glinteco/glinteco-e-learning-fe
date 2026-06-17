'use client';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex justify-between items-center px-lg py-sm w-full bg-surface border-b border-outline-variant shadow-sm">
      <div className="flex items-center gap-sm">
        <span className="material-symbols-outlined md:hidden text-on-surface">menu</span>
        <h1 className="md:hidden text-xl font-bold text-primary">RAMP UP</h1>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input
            className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary w-64"
            placeholder="Search..."
            type="text"
          />
        </div>

        <button className="hover:bg-surface-container-low transition-colors p-2 rounded-full text-on-surface-variant">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <button className="hover:bg-surface-container-low transition-colors p-2 rounded-full text-on-surface-variant hidden md:block">
          <span className="material-symbols-outlined">help</span>
        </button>

        <div className="h-8 w-8 bg-surface-container rounded-full border border-outline-variant flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
        </div>
      </div>
    </header>
  );
}

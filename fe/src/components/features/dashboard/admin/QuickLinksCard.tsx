'use client';

interface QuickLink {
  label: string;
  href: string;
  icon?: string;
}

interface QuickLinksCardProps {
  title: string;
  icon: string;
  links: QuickLink[];
}

export default function QuickLinksCard({ title, icon, links }: QuickLinksCardProps) {
  return (
    <div className="bg-surface border border-outline-variant/70 rounded-lg p-md space-y-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-2 text-primary">
        <span className="material-symbols-outlined">{icon}</span>
        <h4 className="font-label-md text-label-md">{title}</h4>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="flex items-center justify-between p-2 rounded border border-outline-variant/70 hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <span className="text-body-sm">{link.label}</span>
            <span className="material-symbols-outlined text-sm">
              {link.icon || 'chevron_right'}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

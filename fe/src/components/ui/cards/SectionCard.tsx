import type { ReactNode } from 'react';
import { Icon } from '@iconify/react';

interface SectionCardProps {
  title?: string;
  icon?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function SectionCard({
  title,
  icon,
  action,
  children,
  className = '',
  hover = false,
}: SectionCardProps) {
  return (
    <section
      className={`bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm ${hover ? 'hover:shadow-md transition-shadow' : ''} ${className}`}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-6">
          {title && (
            <div className="flex items-center gap-2">
              {icon && (
                <Icon icon={icon} className="text-secondary text-[20px]" />
              )}
              <h3 className="headline-sm text-on-surface">{title}</h3>
            </div>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

'use client';

import type { ReactNode } from 'react';
import { Icon } from '@iconify/react';

interface ActionButton {
  icon: string;
  onClick?: () => void;
  className?: string;
}

interface OnlyTitleItemProps {
  title: string;
  firstIcon?: string;
  lastButton?: ActionButton[];
  className?: string;
}

interface HaveSubtitleItemProps extends OnlyTitleItemProps {
  subtitle: string;
}

interface LessonItemProps {
  title: string;
  subtitle: string;
  dragHandle?: boolean;
  actions?: ActionButton[];
  className?: string;
}

export function OnlyTitleItem({
  title,
  firstIcon,
  lastButton,
  className = '',
}: OnlyTitleItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant ${className}`}
    >
      <div className="flex items-center gap-3">
        {firstIcon && (
          <Icon icon={firstIcon} className="text-secondary text-[20px]" />
        )}
        <span className="body-sm text-on-surface">{title}</span>
      </div>
      {lastButton && lastButton.length > 0 && (
        <div className="flex items-center gap-1">
          {lastButton.map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              className={`p-1 rounded text-secondary hover:text-error transition-colors ${btn.className ?? ''}`}
            >
              <Icon icon={btn.icon} className="text-[18px]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TitleAndSubtitleItem({
  title,
  subtitle,
  firstIcon,
  lastButton,
  className = '',
}: HaveSubtitleItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 bg-surface-container-low rounded-lg border border-outline-variant ${className}`}
    >
      <div className="flex items-center gap-3">
        {firstIcon && (
          <Icon icon={firstIcon} className="text-secondary text-[20px]" />
        )}
        <div>
          <p className="body-sm text-on-surface font-semibold">{title}</p>
          <p className="label-sm text-secondary">{subtitle}</p>
        </div>
      </div>
      {lastButton && lastButton.length > 0 && (
        <div className="flex items-center gap-1">
          {lastButton.map((btn, i) => (
            <button
              key={i}
              onClick={btn.onClick}
              className={`p-1 rounded text-secondary hover:text-error transition-colors ${btn.className ?? ''}`}
            >
              <Icon icon={btn.icon} className="text-[18px]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function LessonItem({
  title,
  subtitle,
  dragHandle = true,
  actions,
  className = '',
}: LessonItemProps) {
  return (
    <div
      className={`flex items-center gap-4 p-4 border border-outline-variant rounded-lg bg-surface-container-low hover:bg-surface-container-lowest hover:shadow-md transition-all group ${className}`}
    >
      {dragHandle && (
        <Icon icon="lucide:grip-vertical" className="text-secondary cursor-move text-[20px]" />
      )}
      <div className="flex-1">
        <p className="label-md text-on-surface font-semibold">{title}</p>
        <p className="label-sm text-secondary">{subtitle}</p>
      </div>
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className={`p-2 hover:bg-surface-variant rounded-lg text-secondary ${action.className ?? ''}`}
            >
              <Icon icon={action.icon} className="text-[20px]" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

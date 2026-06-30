'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DocumentResponseDto } from '@/services/api-client';
import type { RunbookContent, TutorialContent } from './types';

interface TocItem {
  id: string;
  label: string;
  level: number;
}

interface DocumentDetailSidebarProps {
  kind?: string;
  toc: TocItem[];
  tags: DocumentResponseDto['tags'];
  runbookContent?: RunbookContent;
  tutorialContent?: TutorialContent;
}

export function DocumentDetailSidebar({
  kind,
  toc,
  tags,
  runbookContent,
  tutorialContent,
}: DocumentDetailSidebarProps) {
  const t = useTranslations('DocumentDetail');
  const [activeNav, setActiveNav] = useState<string>('');

  const isRunbook = kind === 'Runbook';
  const isTutorial = kind === 'Tutorial';

  const navItems: Array<{ id: string; label: string; icon: string }> = [];

  if (isRunbook && runbookContent) {
    runbookContent.phases.forEach((p) => {
      navItems.push({
        id: p.name.toLowerCase().replace(/\s+/g, '-'),
        label: p.name,
        icon:
          p.name.toLowerCase().includes('diagnos') || p.name.toLowerCase().includes('verify')
            ? 'search'
            : p.name.toLowerCase().includes('resol') || p.name.toLowerCase().includes('fix')
              ? 'bolt'
              : p.name.toLowerCase().includes('verif') || p.name.toLowerCase().includes('close')
                ? 'fact_check'
                : 'chevron_right',
      });
      p.steps.forEach((s, si) => {
        navItems.push({
          id: `${p.name.toLowerCase().replace(/\s+/g, '-')}-step-${si + 1}`,
          label: `  Step ${si + 1}: ${s.title || `Step ${si + 1}`}`,
          icon: 'subdirectory_arrow_right',
        });
      });
    });
  }

  if (isTutorial && tutorialContent) {
    tutorialContent.steps.forEach((s, si) => {
      navItems.push({
        id: `step-${si + 1}`,
        label: `Step ${si + 1}: ${s.title || `Step ${si + 1}`}`,
        icon: 'subdirectory_arrow_right',
      });
    });
  }

  return (
    <aside>
      <div className="sticky top-24 space-y-lg">
        {/* Quick Navigation — for Runbook / Tutorial */}
        {navItems.length > 0 && (
          <div className="bg-white rounded-xl border border-outline-variant p-md shadow-sm">
            <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant pb-sm mb-md">
              Quick Navigation
            </h3>
            <nav className="flex flex-col gap-xs">
              {navItems.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setActiveNav(item.id)}
                    className={`flex items-center justify-between px-md py-sm rounded-lg transition-all ${
                      isActive
                        ? 'bg-surface-container-high text-primary font-semibold'
                        : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-sm">
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span className="text-label-md">{item.label}</span>
                    </div>
                    {isActive && (
                      <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>
        )}

        {/* Standard TOC — for Guide / Reference */}
        {!isRunbook && !isTutorial && toc.length > 0 && (
          <div className="bg-white rounded-xl border border-outline-variant p-md shadow-sm">
            <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant pb-sm mb-md">
              {t('onThisPage')}
            </h3>
            <nav className="flex flex-col gap-xs">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`block px-md py-sm rounded-lg transition-colors ${
                    item.level === 1
                      ? 'text-primary font-bold bg-surface-container-low'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        )}

        {/* Incident Stats — for Runbook */}
        {isRunbook && runbookContent && (
          <div className="bg-inverse-surface text-inverse-on-surface rounded-xl p-md shadow-lg overflow-hidden relative">
            <div className="relative z-10 space-y-md">
              <div className="flex items-center justify-between">
                <p className="text-label-sm font-semibold text-primary-fixed-dim">INCIDENT TIMER</p>
                <span className="flex h-2 w-2 rounded-full bg-error animate-ping" />
              </div>
              <div className="text-3xl font-code tracking-tighter text-white" id="incident-timer">
                00:14:43
              </div>
              <div className="space-y-sm">
                <div className="flex justify-between text-label-sm opacity-70">
                  <span>Progress</span>
                  <span>{Math.round(
                    (runbookContent.phases.reduce((sum, p) => sum + p.steps.length, 0) > 0
                      ? 0
                      : 0)
                  )}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-fixed-dim w-0" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="bg-white rounded-xl border border-outline-variant p-md shadow-sm">
            <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant pb-sm mb-md">
              {t('tags')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 bg-surface-container-high text-on-surface-variant rounded text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container cursor-pointer transition-colors"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

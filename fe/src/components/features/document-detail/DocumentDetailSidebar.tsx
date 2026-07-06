'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DocumentResponseDto } from '@/services/api-client';
import type { RunbookContent, TutorialContent, GuideContent, ReferenceContent } from './types';

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
  guideContent?: GuideContent;
  referenceContent?: ReferenceContent;
}

export function DocumentDetailSidebar({
  kind,
  toc,
  tags,
  runbookContent,
  tutorialContent,
  guideContent,
  referenceContent,
}: DocumentDetailSidebarProps) {
  const t = useTranslations('DocumentDetail');
  const [activeNav, setActiveNav] = useState<string>('');

  const isRunbook = kind === 'Runbook';
  const isTutorial = kind === 'Tutorial';
  const isGuide = kind === 'Guide';
  const isReference = kind === 'Reference';

  const navItems: Array<{ id: string; label: string; icon: string }> = [];

  if (isRunbook && runbookContent) {
    if (runbookContent.trigger) {
      navItems.push({ id: 'runbook-trigger', label: t('trigger'), icon: 'bolt' });
    }
    if (runbookContent.impact) {
      navItems.push({ id: 'runbook-impact', label: t('impact'), icon: 'warning' });
    }
    if ((runbookContent.prerequisites || []).length > 0) {
      navItems.push({ id: 'runbook-prerequisites', label: t('prerequisites'), icon: 'checklist' });
    }
    if (runbookContent.procedure) {
      navItems.push({ id: 'runbook-procedure', label: t('procedure'), icon: 'integration_instructions' });
    }
    if (runbookContent.validation) {
      navItems.push({ id: 'runbook-validation', label: t('validation'), icon: 'check_circle' });
    }
    if (runbookContent.rollback) {
      navItems.push({ id: 'runbook-rollback', label: t('rollback'), icon: 'history' });
    }
    if (runbookContent.escalation) {
      navItems.push({ id: 'runbook-escalation', label: t('escalation'), icon: 'notifications_active' });
    }
  }

  if (isGuide && guideContent) {
    if (guideContent.objective) {
      navItems.push({ id: 'guide-objective', label: t('objective'), icon: 'menu_book' });
    }
    if ((guideContent.prerequisites || []).length > 0) {
      navItems.push({ id: 'guide-prerequisites', label: t('prerequisites'), icon: 'checklist' });
    }
    if (guideContent.steps || guideContent.body) {
      navItems.push({ id: 'guide-steps', label: t('steps'), icon: 'format_list_numbered' });
    }
    if (guideContent.expectedResult) {
      navItems.push({ id: 'guide-expected-result', label: t('expectedResult'), icon: 'task_alt' });
    }
    if ((guideContent.relatedDocs || []).length > 0) {
      navItems.push({ id: 'guide-related-docs', label: t('relatedDocs'), icon: 'library_books' });
    }
  }

  if (isTutorial && tutorialContent) {
    if ((tutorialContent.learningObjectives || []).length > 0) {
      navItems.push({ id: 'tutorial-objectives', label: t('learningObjectives'), icon: 'school' });
    }
    if ((tutorialContent.prerequisites || []).length > 0) {
      navItems.push({ id: 'tutorial-prerequisites', label: t('prerequisites'), icon: 'checklist' });
    }
    if (typeof tutorialContent.steps === 'string' && tutorialContent.steps) {
      navItems.push({ id: 'tutorial-steps', label: t('steps'), icon: 'format_list_numbered' });
    }
    const stepsArr = Array.isArray(tutorialContent.steps) ? tutorialContent.steps : (tutorialContent.legacySteps || []);
    if (stepsArr.length > 0) {
      navItems.push({ id: 'tutorial-interactive-steps', label: t('progress'), icon: 'playlist_add_check' });
      stepsArr.forEach((s: any, si: number) => {
        navItems.push({
          id: `step-${si + 1}`,
          label: `${t('step')} ${si + 1}: ${s.title || `${t('step')} ${si + 1}`}`,
          icon: 'subdirectory_arrow_right',
        });
      });
    }
    if ((tutorialContent.exercises || []).length > 0) {
      navItems.push({ id: 'tutorial-exercises', label: t('exercises'), icon: 'fitness_center' });
    }
    if (tutorialContent.summary) {
      navItems.push({ id: 'tutorial-summary', label: t('summary'), icon: 'emoji_events' });
    }
  }

  if (isReference && referenceContent) {
    if ((referenceContent.properties || []).length > 0) {
      navItems.push({ id: 'reference-properties', label: t('properties'), icon: 'tune' });
    }
    if (referenceContent.examples) {
      navItems.push({ id: 'reference-examples', label: t('examples'), icon: 'code' });
    }
    if (referenceContent.notes) {
      navItems.push({ id: 'reference-notes', label: t('notes'), icon: 'info' });
    }
    (referenceContent.sections || []).forEach((s) => {
      const id = s.heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      navItems.push({ id, label: s.heading, icon: 'label' });
    });
  }

  return (
    <aside>
      <div className="sticky top-24 space-y-6">
        {/* Quick Navigation — for Runbook / Tutorial / Guide / Reference */}
        {navItems.length > 0 && (
          <div className="bg-white rounded-xl border border-outline-variant p-md shadow-sm">
            <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant pb-3 mb-4">
              {t('quickNavigation')}
            </h3>
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setActiveNav(item.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-surface-container-high text-primary font-semibold'
                        : 'text-on-surface hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-[18px] flex-shrink-0">{item.icon}</span>
                      <span className="text-label-md truncate">{item.label}</span>
                    </div>
                  </a>
                );
              })}
            </nav>
          </div>
        )}

        {/* Standard TOC — for fallback */}
        {!isRunbook && !isTutorial && !isGuide && !isReference && toc.length > 0 && (
          <div className="bg-white rounded-xl border border-outline-variant p-md shadow-sm">
            <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant pb-3 mb-4">
              {t('onThisPage')}
            </h3>
            <nav className="flex flex-col gap-1">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`block px-3 py-2 rounded-lg transition-colors ${
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

        {/* Tags */}
        {tags.length > 0 && (
          <div className="bg-white rounded-xl border border-outline-variant p-md shadow-sm">
            <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant pb-3 mb-4">
              {t('tags')}
            </h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1.5 bg-surface-container-high text-on-surface-variant rounded-md text-xs font-semibold hover:bg-primary-container hover:text-on-primary-container cursor-pointer transition-colors"
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

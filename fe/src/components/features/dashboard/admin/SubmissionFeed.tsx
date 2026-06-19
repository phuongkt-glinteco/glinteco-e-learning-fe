'use client';

import { useTranslations } from 'next-intl';
import Avatar from '@/components/ui/Avatar';

interface SubmissionUser {
  id: string;
  name: string;
  avatarHue?: number;
}

interface SubmissionItem {
  id: string;
  user: SubmissionUser;
  exercise: string;
  prUrl: string;
  status: 'pending_review' | 'changes_requested' | 'approved';
  timeAgo: string;
}

interface SubmissionFeedProps {
  items: SubmissionItem[];
  totalCount: number;
  statusCounts: { pending: number; changes: number; approved: number };
  oldestAgo: string;
  onFilter: () => void;
  onViewAll: () => void;
}

const statusStyles: Record<string, string> = {
  pending_review: 'bg-amber-100 text-amber-800',
  changes_requested: 'bg-red-100 text-red-700',
  approved: 'bg-green-100 text-green-700',
};

export default function SubmissionFeed({ items, totalCount, statusCounts, oldestAgo, onFilter, onViewAll }: SubmissionFeedProps) {
  const t = useTranslations('AdminDashboardPage');
  return (
    <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden h-[600px] flex flex-col">
      <div className="p-gutter border-b border-outline-variant flex justify-between items-center">
        <button
          onClick={onFilter}
          className="flex items-center gap-2 px-3 py-1.5 border border-outline text-label-sm rounded hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-sm">filter_list</span>
          {t('filter')}
        </button>
        <h3 className="font-h3 text-h3">{t('recentSubmissions')}</h3>
      </div>
      <div className="overflow-x-auto flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low border-b border-outline-variant">
            <tr className="w-full">
              <th colSpan={5} className="px-6 py-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-label-sm font-bold text-on-surface uppercase tracking-wider">
                      {t('totalSubmissions', { count: totalCount })}
                    </span>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">
                        {statusCounts.pending} {t('pending')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-[10px] font-bold">
                        {statusCounts.changes} {t('changes')}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-green-100 text-green-600 text-[10px] font-bold">
                        {statusCounts.approved} {t('approved')}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium uppercase">
                    {t('oldest', { time: oldestAgo })}
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                <td className="px-6 py-4 w-[30%] align-middle">
                  <div className="flex items-center gap-3">
                    <Avatar name={item.user.name} hue={item.user.avatarHue} size={32} />
                    <div>
                      <p className="text-label-md font-bold text-primary">{item.user.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 w-[25%] align-middle">
                  <p className="text-body-sm font-medium">{item.exercise}</p>
                </td>
                <td className="px-6 py-4 text-center w-[15%] align-middle text-left">
                  <a
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium text-xs"
                    href={item.prUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    <span>{t('viewPr')}</span>
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                </td>
                <td className="px-6 py-4 w-[15%] align-middle text-left">
                  <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${statusStyles[item.status]}`}>
                    {item.status === 'pending_review' ? t('pendingReview') : item.status === 'changes_requested' ? t('changesRequested') : t('approvedStatus')}
                  </span>
                </td>
                <td className="px-6 py-4 text-on-surface-variant text-body-sm w-[15%] align-middle text-left">
                  {item.timeAgo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-outline-variant bg-surface-container-lowest flex justify-center">
        <button
          onClick={onViewAll}
          className="text-primary text-label-md font-bold hover:underline flex items-center gap-1"
        >
          {t('viewAllSubmissions')}
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

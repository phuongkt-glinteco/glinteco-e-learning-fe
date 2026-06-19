'use client';

import StatsCard from './StatsCard';
import SubmissionFeed from './SubmissionFeed';
import CohortVelocityChart from './CohortVelocityChart';
import QuickLinksCard from './QuickLinksCard';
import { ProgressBar } from '@/components/ui/HPBar';

const stats = [
  {
    label: 'Active Learners',
    value: '14',
    sub: '+3 this week',
    icon: 'group',
    accent: 'text-blue-500',
    children: <ProgressBar value={70} className="mt-2" />,
  },
  {
    label: 'Avg. Completion',
    value: '58%',
    sub: '+12% vs last week',
    icon: 'query_stats',
    accent: 'text-emerald-500',
    children: <ProgressBar value={58} barClassName="bg-emerald-500" className="mt-2" />,
  },
  {
    label: 'Pending Reviews',
    value: '3',
    sub: 'Oldest: 3h ago',
    icon: 'reviews',
    accent: 'text-amber-500',
    children: (
      <div className="flex gap-1 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              i <= 3 ? 'bg-amber-500' : 'bg-surface-container'
            }`}
          />
        ))}
      </div>
    ),
  },
  {
    label: 'Ramp-up Speed',
    value: '11d',
    sub: 'Target: 14d',
    icon: 'speed',
    accent: 'text-on-surface-variant',
    children: (
      <p className="text-[10px] text-emerald-500 font-bold uppercase mt-2">
        3 Days Ahead of Schedule
      </p>
    ),
  },
];

const submissions = [
  {
    id: 's1',
    user: {
      id: 'u_jordan',
      name: 'Jordan Smith',
      role: 'Engineering I',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBk4i-tAc99cWu9BfJGyQW_Wio0eCRBYFPclluvimoYMkBlf_UlJ3w3Dfnci3GURCHdwPl29BbUfrSNEoGI4VqL920X9poKBDMSxls12iJjSlh0E5vF_5kBDfRBvoQY3_XkW_swLRhCCO4ws0eINZtKDgEs4L5DAMkqAlJmnNzRgp5lcgY9QCNG3vX3Hxqv6zBpp_a_DVQp0XPEPSNUqPEjwBSTe1B6ikFo2p58lp0t2HFl7hxjMz6wEviu4f8HOiATJKdwlFLQXGvG',
    },
    exercise: 'Auth Middleware',
    prUrl: '#',
    status: 'pending_review' as const,
    timeAgo: '3h ago',
  },
  {
    id: 's2',
    user: {
      id: 'u_sarah',
      name: 'Sarah Chen',
      role: 'Intern',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzei1-hPog6jZ4XMWkAdUovPndBuPVUVfqvS6HH_sZT75_mzmKX3flqsURR5G7W39RlOLa9w4kVG38htVp4Vlmp9GvK8qhffQF64PmKsqvrBMGFofJLyGi-qcY_D4DJcEVfXVq1y02tJNIkc5_iCZEuZNDoGYfMCHIBD4nCUPz3dyTqQMxUkZXBdJuI6nKq3gMYkIohRRSKJOzkrqYP6_-FStNBOJwJKfcXq95VJZrULK-u34YwBd9AESlqssw2gsVkfFiUNXyOOUG',
    },
    exercise: 'React State Patterns',
    prUrl: '#',
    status: 'changes_requested' as const,
    timeAgo: '5h ago',
  },
  {
    id: 's3',
    user: {
      id: 'u_marcus',
      name: 'Marcus Lu',
      role: 'Engineering I',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6ntl6_rajJY8ha9frG5u-faKp-949O9OYku2F172vlVXCEtHHujiLuPRrPHOwBb4yQua_E3IV6DhV5FFD6Z-8DK75bvyf2h1nQ-qGmkHKeN8aoM_U3iAwCU-1GGNRj23jaqo0S0mPLBuQeFqxHySFSYq3ecx19rlQoB4CBvjR5UxP46ksnpr78vlWekDaSRmSKK4qepY33JPraxlOHm4i5omHdgEBRmhG9QdKGn89guCn6kpMt49gWonClJfTjKYINLXoLTstgW5b',
    },
    exercise: 'SQL Optimization',
    prUrl: '#',
    status: 'approved' as const,
    timeAgo: '1d ago',
  },
];

const velocityData = [
  { label: 'Mon', value: 40 },
  { label: 'Tue', value: 55 },
  { label: 'Wed', value: 45 },
  { label: 'Thu', value: 75 },
  { label: 'Fri', value: 60 },
  { label: 'Sat', value: 85 },
  { label: 'Sun', value: 95 },
];

export default function AdminDashboardPage() {
  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-headline-lg-mobile md:text-headline-lg text-primary font-bold">
            Dashboard Overview
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {stats.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="lg:col-span-2">
          <SubmissionFeed
            items={submissions}
            totalCount={3}
            statusCounts={{ pending: 1, changes: 1, approved: 1 }}
            oldestAgo="3h"
            onFilter={() => {}}
            onViewAll={() => {}}
          />
        </div>
        <div className="flex flex-col justify-between mb-2">
          <CohortVelocityChart data={velocityData} />
          <QuickLinksCard
            title="Curriculum Management"
            icon="edit_note"
            links={[
              { label: 'Track Editor', href: '#' },
              { label: 'Lesson Planner', href: '#', icon: 'chevron_right' },
            ]}
          />
          <QuickLinksCard
            title="Documentation Portal"
            icon="menu_book"
            links={[
              { label: 'Manage Docs', href: '#', icon: 'open_in_new' },
            ]}
          />
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}

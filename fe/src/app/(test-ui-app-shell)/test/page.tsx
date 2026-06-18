'use client';

import { useState } from 'react';
import SectionHead from '@/components/ui/SectionHead';
import Avatar from '@/components/ui/Avatar';
import LanguageToggle from '@/components/ui/LanguageToggle';
import HPBar from '@/components/ui/HPBar';
import Modal from '@/components/ui/Modal';
import Stat from '@/components/ui/Stat';
import CircleMeter from '@/components/ui/CircleMeter';
import GoogleLoginButton from '@/components/ui/GoogleLoginButton';
import { StatusBadge, Tag, TimeBadge } from '@/components/ui/Badge';
import { ApiErrorItem } from '@/components/ui/ApiErrorItem';

function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer"
      >
        Open Modal
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Demo Modal">
        <p className="text-sm text-slate-600">This is a demo modal content.</p>
      </Modal>
    </>
  );
}

const components: Array<{ name: string; Component: React.ReactNode }> = [
  {
    name: 'SectionHead',
    Component: <SectionHead title="Section Title" kicker="Kicker" />,
  },
  {
    name: 'Avatar',
    Component: (
      <div className="flex gap-4 items-center">
        <Avatar name="John Doe" />
        <Avatar name="Jane Smith" hue={280} />
        <Avatar name="Alex" hue={45} size={52} ring />
      </div>
    ),
  },
  {
    name: 'LanguageToggle',
    Component: <LanguageToggle />,
  },
  {
    name: 'HPBar',
    Component: (
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <HPBar value={75} />
        <HPBar value={35} segments={10} warn />
      </div>
    ),
  },
  {
    name: 'Modal',
    Component: <ModalDemo />,
  },
  {
    name: 'Stat',
    Component: (
      <div className="grid grid-cols-3 gap-4 w-full max-w-lg">
        <Stat label="Completed" value={12} icon="lucide:check-circle" accent />
        <Stat label="In Progress" value={5} icon="lucide:clock" />
        <Stat label="Total" value={24} icon="lucide:layers" />
      </div>
    ),
  },
  {
    name: 'CircleMeter',
    Component: <CircleMeter value={72} label="Progress" />,
  },
  {
    name: 'GoogleLoginButton',
    Component: (
      <div className="w-full max-w-xs">
        <GoogleLoginButton
          title="Sign in with Google"
          onSuccess={() => Promise.resolve()}
        />
      </div>
    ),
  },
  {
    name: 'StatusBadge',
    Component: (
      <div className="flex gap-2 flex-wrap">
        <StatusBadge status="completed" />
        <StatusBadge status="in_progress" />
        <StatusBadge status="locked" />
        <StatusBadge status="approved" />
        <StatusBadge status="submitted" />
        <StatusBadge status="pending" />
        <StatusBadge status="changes" />
      </div>
    ),
  },
  {
    name: 'Tag',
    Component: (
      <div className="flex gap-2 flex-wrap">
        <Tag name="Frontend" />
        <Tag name="NestJS" />
        <Tag name="Architecture" />
        <Tag name="Testing" />
      </div>
    ),
  },
  {
    name: 'TimeBadge',
    Component: <TimeBadge time="2h 30m" />,
  },
  {
    name: 'ApiErrorItem',
    Component: <ApiErrorItem error_code="ERR001" onClose={() => {}} />,
  },
];

export default function TestPage() {
  return (
    <div className="p-8 space-y-10">
      <SectionHead title="UI Components Test" kicker="components/ui" />
      <div className="grid grid-cols-1 gap-8">
        {components.map(({ name, Component }) => (
          <div key={name} className="border border-outline-variant rounded-xl p-6 bg-surface">
            <div className="text-xs font-mono font-semibold text-on-surface-variant mb-4 uppercase tracking-wider">
              {name}
            </div>
            <div className="flex items-center justify-center min-h-[60px]">
              {Component}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

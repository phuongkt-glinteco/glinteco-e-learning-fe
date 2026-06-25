'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import UserProfileAvatar from './UserProfileAvatar';
import NavMenu from './NavMenu';
import { adminMainNav, footerNav, learnerMainNav } from './Sidebar';

interface MobileSideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSideBar({ isOpen, onClose }: MobileSideBarProps) {
  const { user } = useAuth();
  const navItems = user?.role === 'admin' ? adminMainNav : learnerMainNav;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col h-screen w-screen bg-background transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      {/* TopAppBar inside the mobile sidebar */}
      <header className="docked full-width top-0 sticky z-40 flex justify-between items-center px-lg py-sm w-full bg-surface border-b border-outline-variant shadow-sm transition-all duration-200 ease-in-out">
        <div className="flex items-center gap-sm">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">
            RAMP UP
          </h1>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <button
            onClick={onClose}
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      {/* Scrollable Content Canvas */}
      <div className="flex-1 overflow-y-auto p-margin-mobile">
        <div className="flex flex-col h-full bg-surface p-margin-mobile gap-lg rounded-xl">
          {/* User Profile */}
          <UserProfileAvatar size="lg" showDetails={true} name="Alex" role="Backend Engineer" className="pb-2" />

          {/* Menu Items */}
          <div className="flex flex-col gap-2">
            
            <NavMenu items={navItems} variant="mobile" onItemClick={onClose} />

            <div className="my-2 border-t border-outline-variant"></div>

            <NavMenu items={footerNav} variant="mobile" onItemClick={onClose} className="self-end"/>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import AppLogo from './AppLogo';

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export default function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex justify-between items-center px-lg py-sm w-full bg-surface border-b border-outline-variant shadow-sm">
      <AppLogo />
      
      <button
        onClick={onOpenSidebar}
        className="hover:bg-surface-container-low transition-colors p-2 rounded-full text-on-surface-variant"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>
    </header>
  );
}

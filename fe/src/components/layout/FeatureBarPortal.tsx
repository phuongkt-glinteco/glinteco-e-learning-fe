'use client';

import { useEffect, type ReactNode } from 'react';
import { useFeatureBarStore } from '@/stores/featureBarStore';

interface FeatureBarPortalProps {
  bottomBar?: ReactNode;
  rightSidebar?: ReactNode;
}

export function FeatureBarPortal({ bottomBar, rightSidebar }: FeatureBarPortalProps) {
  const { setBottomBar, setRightSidebar } = useFeatureBarStore();

  useEffect(() => {
    setBottomBar(bottomBar || null);
    return () => {
      setBottomBar(null);
    };
  }, [bottomBar, setBottomBar]);

  useEffect(() => {
    setRightSidebar(rightSidebar || null);
    return () => {
      setRightSidebar(null);
    };
  }, [rightSidebar, setRightSidebar]);

  return null;
}

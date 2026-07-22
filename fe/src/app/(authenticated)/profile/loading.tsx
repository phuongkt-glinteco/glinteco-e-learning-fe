import React from 'react';
import { ProfileSkeleton } from '@/components/features/profile';

export default function ProfileLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <ProfileSkeleton />
    </div>
  );
}

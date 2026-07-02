'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/default/skeleton';
import { Card, CardContent } from '@/components/ui/default/card';

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-lg w-full animate-pulse">
      {/* Top section: Personal Card & Gamification Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Personal Card Skeleton */}
        <Card className="lg:col-span-1 border border-outline-variant bg-surface-container-low">
          <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="w-3/4 h-6 rounded" />
            <Skeleton className="w-1/2 h-4 rounded" />
            <Skeleton className="w-1/3 h-5 rounded-full mt-2" />
            <div className="w-full border-t border-outline-variant my-2" />
            <div className="w-full flex justify-between">
              <Skeleton className="w-1/3 h-4 rounded" />
              <Skeleton className="w-1/3 h-4 rounded" />
            </div>
          </CardContent>
        </Card>

        {/* Gamification Stats Skeleton */}
        <Card className="lg:col-span-2 border border-outline-variant bg-surface-container-low">
          <CardContent className="p-6 flex flex-col justify-between h-full gap-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-2">
                <Skeleton className="w-32 h-4 rounded" />
                <Skeleton className="w-48 h-8 rounded" />
              </div>
              <Skeleton className="w-28 h-10 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <Skeleton className="w-24 h-4 rounded" />
                <Skeleton className="w-16 h-4 rounded" />
              </div>
              <Skeleton className="w-full h-4 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-outline-variant pt-4">
              <div className="flex flex-col gap-1">
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-28 h-6 rounded" />
              </div>
              <div className="flex flex-col gap-1">
                <Skeleton className="w-20 h-4 rounded" />
                <Skeleton className="w-28 h-6 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom section: Activity Breakdown Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="border border-outline-variant bg-surface-container-low">
            <CardContent className="p-5 flex flex-col gap-3">
              <Skeleton className="w-1/2 h-5 rounded" />
              <Skeleton className="w-3/4 h-8 rounded" />
              <Skeleton className="w-full h-3 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

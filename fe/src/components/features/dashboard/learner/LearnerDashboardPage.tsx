'use client';

import { useEffect, useState } from 'react';
import {
  getUsersMeStats,
  getDocumentsRecent,
  getTracks,
} from '@/services/api-client';
import type {
  UserDashboardStats,
  TrackSummary,
} from '@/services/api-client';
import { useAuth } from '@/providers/AuthProvider';
import WelcomeSection from './WelcomeSection';
import StatsGrid from './StatsGrid';
import ContinueLearningSection from './ContinueLearningSection';
import LearningActivitySection from './LearningActivitySection';
import RecentDocumentsSection from './RecentDocumentsSection';

interface RecentDoc {
  title: string;
  tags: string[];
  icon: string;
  viewedAt: string;
}

export default function LearnerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [tracks, setTracks] = useState<TrackSummary[]>([]);
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || authLoading) return;
    let cancelled = false;

    async function fetchData() {
      try {
        const [statsRes, docsRes, tracksRes] = await Promise.all([
          getUsersMeStats({ throwOnError: true }),
          getDocumentsRecent({ throwOnError: true }),
          getTracks({ throwOnError: true }),
        ]);
        if (cancelled) return;
        setStats(statsRes.data);
        setTracks(tracksRes.data?.data ?? []);
        setRecentDocs(
          (docsRes.data?.data ?? []).map((doc) => ({
            title: doc.title ?? '',
            tags: doc.tags ?? [],
            icon: 'description',
            viewedAt: '',
          }))
        );
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();

    return () => {
      cancelled = true;
    };
  }, [mounted, authLoading]);

  if (authLoading || !mounted) return null;
  if (loading) return <DashboardSkeleton />;
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Failed to load dashboard. Please try again.</p>
      </div>
    );
  }

  const currentTrack = tracks.find((t) => t.status === 'in_progress');

  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-lg">
      <WelcomeSection
        name={user?.name ?? 'Learner'}
        title={user?.title ?? 'Engineer'}
        cohortId={user?.cohortId ?? ''}
      />
      <StatsGrid
        overallCompletion={stats?.overallCompletion ?? 0}
        xp={stats?.xp ?? 0}
        xpThisWeek={stats?.xpThisWeek ?? 0}
        level={stats?.level ?? 1}
        streakDays={stats?.streakDays ?? 0}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div className="flex flex-col gap-lg lg:col-span-3">
          {currentTrack && (
            <ContinueLearningSection
              moduleLabel={`Module ${currentTrack.order ?? '?'}`}
              timeLeft={currentTrack.estimatedTime ?? ''}
              title={currentTrack.title ?? ''}
              description={currentTrack.description ?? ''}
              progress={
                currentTrack.lessonCount
                  ? Math.round(
                      ((currentTrack.lessonsCompleted ?? 0) /
                        currentTrack.lessonCount) *
                        100
                    )
                  : 0
              }
              icon={currentTrack.icon ?? 'data_object'}
              onContinue={() => {}}
              onViewPath={() => {}}
            />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            <LearningActivitySection
              tracks={{
                completed: stats?.tracks?.completed ?? 0,
                total: stats?.tracks?.total ?? 0,
              }}
              exercises={{
                total: stats?.exercises?.total ?? 0,
                approved: stats?.exercises?.approved ?? 0,
                awaitingReview: stats?.exercises?.awaitingReview ?? 0,
              }}
              savedDocs={{
                total: stats?.savedDocs?.total ?? 0,
                unread: stats?.savedDocs?.unread ?? 0,
              }}
            />
            <RecentDocumentsSection docs={recentDocs} />
          </div>
        </div>
      </div>
      <div className="h-8" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-lg animate-pulse">
      <div className="h-24 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-100 rounded-xl" />
        ))}
      </div>
      <div className="h-48 bg-gray-100 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

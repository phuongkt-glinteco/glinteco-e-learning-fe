import type { LearnerTrack, TrackStatus } from './types';
import { TrackCard } from './TrackCard';

export type TrackFilter = 'all' | TrackStatus;

interface TracksGridProps {
  tracks: LearnerTrack[];
  query: string;
  filter: TrackFilter;
  openingTrackId: string | null;
  actionError: string | null;
  onQueryChange: (query: string) => void;
  onFilterChange: (filter: TrackFilter) => void;
  onOpenTrack: (track: LearnerTrack) => void;
}

const filters: { label: string; value: TrackFilter }[] = [
  { label: 'All Tracks', value: 'all' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Locked', value: 'locked' },
];

export function TracksGrid({
  tracks,
  query,
  filter,
  openingTrackId,
  actionError,
  onQueryChange,
  onFilterChange,
  onOpenTrack,
}: TracksGridProps) {
  return (
    <section className="mx-auto flex max-w-container-max flex-col gap-6 px-gutter py-8">
      <header>
        <h1 className="headline-lg text-primary">Learning Tracks</h1>
        <p className="mt-2 body-md text-on-surface-variant">
          Explore available courses to advance your engineering skills.
        </p>
      </header>

      <div className="flex flex-col gap-4 border-b border-outline-variant pb-5 xl:flex-row xl:items-center">
        <label className="relative min-w-0 flex-1 xl:max-w-[560px]">
          <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-on-surface-variant">
            search
          </span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            className="h-12 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-12 pr-4 body-sm text-on-surface outline-none transition-colors placeholder:text-outline focus:border-primary"
            placeholder="Search courses..."
            type="search"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          {filters.map((item) => {
            const active = item.value === filter;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onFilterChange(item.value)}
                className={`h-12 rounded-full border px-6 label-md transition-colors ${
                  active
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-error-container bg-error-container/40 p-4 label-sm text-error">
          {actionError}
        </div>
      )}

      {tracks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-10 text-center">
          <h2 className="headline-sm text-on-surface">No learning tracks found</h2>
          <p className="mt-2 body-sm text-on-surface-variant">
            Try a different search term or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isOpening={openingTrackId === track.id}
              onOpenTrack={onOpenTrack}
            />
          ))}
        </div>
      )}
    </section>
  );
}

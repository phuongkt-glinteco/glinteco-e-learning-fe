'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import UserProfileAvatar from './UserProfileAvatar';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/AuthProvider';
import { SidebarTrigger } from '@/components/ui/default/sidebar';
import { NotificationPopoverContainer } from '@/components/features/notifications/containers/NotificationPopoverContainer';
import { searchControllerGlobalSearch, type SearchResponseDto } from '@/services/api-client';

type SearchResult = SearchResponseDto;

export default function Header() {
  const t = useTranslations('AppShell');
  const router = useRouter();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await searchControllerGlobalSearch({ query: { q } });
      setSearchResults(res.data as SearchResult);
    } catch {
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setSearchOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSearch(value), 350);
  }, [fetchSearch]);

  const hasResults = searchResults && (
    searchResults.tracks.length > 0 ||
    searchResults.documents.length > 0 ||
    searchResults.exercises.length > 0
  );

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults(null);
  };

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  return (
    <header className="flex-shrink-0 sticky top-0 z-30 flex justify-between items-center px-4 py-sm w-full bg-surface border-b border-outline-variant shadow-sm h-[72px]">
      <div className="flex items-center gap-sm">
        <SidebarTrigger className="mr-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high" />
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Search Input */}
        <div className="relative hidden md:block" ref={searchRef}>
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input
            suppressHydrationWarning
            className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-sm focus:outline-none focus:border-primary w-64"
            placeholder={t('searchPlaceholder')}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchQuery && setSearchOpen(true)}
          />

          {/* Search Results Dropdown */}
          {searchOpen && (searchQuery.trim() !== '' || searchLoading) && (
            <div className="absolute right-0 top-full mt-2 w-[380px] bg-surface border border-outline-variant rounded-2xl shadow-lg overflow-hidden z-50 max-h-[420px] overflow-y-auto">
              {searchLoading && !hasResults ? (
                <div className="p-6 text-center text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px] animate-spin align-middle mr-1">progress_activity</span>
                  {t('searchPlaceholder')}
                </div>
              ) : !hasResults ? (
                <div className="p-6 text-center text-xs text-on-surface-variant">
                  {t('searchNoResults')}
                </div>
              ) : (
                <div className="py-2">
                  {/* Tracks */}
                  {searchResults.tracks.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {t('searchTracks')}
                      </div>
                      {searchResults.tracks.map((track) => (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => { closeSearch(); router.push(`/admin/tracks/${track.id}`); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-container-low transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px] text-primary">route</span>
                          <span className="text-sm text-on-surface truncate">{track.title}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Documents */}
                  {searchResults.documents.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {t('searchDocuments')}
                      </div>
                      {searchResults.documents.map((doc) => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => { closeSearch(); router.push(`/documents`); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-container-low transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px] text-amber-600">description</span>
                          <span className="text-sm text-on-surface truncate">{doc.title}</span>
                          <span className="text-[10px] text-on-surface-variant ml-auto shrink-0">{doc.kind}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Exercises */}
                  {searchResults.exercises.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                        {t('searchExercises')}
                      </div>
                      {searchResults.exercises.map((ex) => (
                        <button
                          key={ex.id}
                          type="button"
                          onClick={() => { closeSearch(); router.push(`/admin/tracks`); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-container-low transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px] text-emerald-600">task_alt</span>
                          <span className="text-sm text-on-surface truncate">{ex.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <NotificationPopoverContainer />

        <div className="relative" ref={dropdownRef}>
          <div onClick={() => setDropdownOpen(!dropdownOpen)} className="cursor-pointer">
            <UserProfileAvatar size="sm" />
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant rounded-lg shadow-card py-1 z-50">
              <div className="px-4 py-2 border-b border-outline-variant">
                <p className="text-label-sm font-bold text-on-surface truncate">
                  {user?.name ?? 'User'}
                </p>
                <p className="text-[11px] text-on-surface-variant truncate">
                  {user?.email ?? ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push('/profile');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-body-sm text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-lg flex-shrink-0">person</span>
                <span className="truncate">{t('profile')}</span>
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push('/logout');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-body-sm text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-lg flex-shrink-0">logout</span>
                <span className="truncate">{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}




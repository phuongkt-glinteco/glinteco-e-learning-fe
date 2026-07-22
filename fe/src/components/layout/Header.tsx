'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import UserProfileAvatar from './UserProfileAvatar';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/AuthProvider';
import { SidebarTrigger } from '@/components/ui/default/sidebar';
import { NotificationPopoverContainer } from '@/components/features/notifications/containers/NotificationPopoverContainer';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/default/command';
import { searchControllerGlobalSearch, type SearchResponseDto } from '@/services/api-client';

type SearchResult = SearchResponseDto;

export default function Header() {
  const t = useTranslations('AppShell');
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fixed position state for dropdowns
  const [searchDropdownStyle, setSearchDropdownStyle] = useState<React.CSSProperties>({});
  const [avatarDropdownStyle, setAvatarDropdownStyle] = useState<React.CSSProperties>({});

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
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSearch(value), 350);
  }, [fetchSearch]);

  const activateSearch = useCallback(() => {
    setSearchActive(true);
  }, []);

  const deactivateSearch = useCallback(() => {
    setSearchActive(false);
    setSearchQuery('');
    setSearchResults(null);
    setSearchLoading(false);
  }, []);

  const navigateTo = useCallback((path: string) => {
    deactivateSearch();
    router.push(path);
  }, [router, deactivateSearch]);

  const hasResults = searchResults && (
    searchResults.tracks.length > 0 ||
    searchResults.documents.length > 0 ||
    searchResults.exercises.length > 0
  );

  const showSearchDropdown = searchActive && searchQuery.trim().length > 0;

  const renderResults = () => (
    <>
      {searchLoading && !hasResults ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          {t('searchLoading')}
        </div>
      ) : !hasResults ? (
        <CommandEmpty>{t('searchNoResults')}</CommandEmpty>
      ) : (
        <>
          {searchResults.tracks.length > 0 && (
            <CommandGroup heading={t('searchTracks')}>
              {searchResults.tracks.map((track) => (
                <CommandItem
                  key={track.id}
                  value={`track-${track.id}`}
                  onSelect={() => navigateTo(isAdmin ? `/admin/tracks/${track.id}` : `/tracks/${track.id}`)}
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">route</span>
                  <span className="truncate">{track.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchResults.documents.length > 0 && (
            <CommandGroup heading={t('searchDocuments')}>
              {searchResults.documents.map((doc) => (
                <CommandItem
                  key={doc.id}
                  value={`doc-${doc.id}`}
                  onSelect={() => navigateTo(`/documents/${doc.id}`)}
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-600">description</span>
                  <span className="truncate">{doc.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{doc.kind}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchResults.exercises.length > 0 && (
            <CommandGroup heading={t('searchExercises')}>
              {searchResults.exercises.map((ex) => (
                <CommandItem
                  key={ex.id}
                  value={`exercise-${ex.id}`}
                  onSelect={() => navigateTo(`/exercises/${ex.id}`)}
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">task_alt</span>
                  <span className="truncate">{ex.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{ex.tag}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </>
      )}
    </>
  );

  // Auto-focus input when search activates
  useEffect(() => {
    if (searchActive) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [searchActive]);

  // Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchActive) {
          deactivateSearch();
        } else {
          activateSearch();
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchActive, activateSearch, deactivateSearch]);

  // Calculate fixed position for search dropdown
  const updateSearchDropdownPos = useCallback(() => {
    if (searchContainerRef.current) {
      const rect = searchContainerRef.current.getBoundingClientRect();
      setSearchDropdownStyle({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  useEffect(() => {
    if (!showSearchDropdown) return;
    updateSearchDropdownPos();
    window.addEventListener('resize', updateSearchDropdownPos);
    return () => window.removeEventListener('resize', updateSearchDropdownPos);
  }, [showSearchDropdown, updateSearchDropdownPos]);

  // Calculate fixed position for avatar dropdown
  const updateAvatarDropdownPos = useCallback(() => {
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setAvatarDropdownStyle({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    updateAvatarDropdownPos();
    window.addEventListener('resize', updateAvatarDropdownPos);
    return () => window.removeEventListener('resize', updateAvatarDropdownPos);
  }, [dropdownOpen, updateAvatarDropdownPos]);

  // Close search dropdown on outside click
  useEffect(() => {
    if (!showSearchDropdown) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node) &&
        // Check if click is inside the fixed dropdown
        !(e.target as HTMLElement).closest('[data-search-dropdown]')
      ) {
        deactivateSearch();
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchDropdown, deactivateSearch]);

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
        {/* Search — icon button → animated expand input */}
        <div className="relative hidden md:block size-10" ref={searchContainerRef}>
          {/* Collapsed: icon button — fills container */}
          <button
            type="button"
            onClick={activateSearch}
            className={[
              'absolute inset-0 flex items-center justify-center rounded-full bg-surface-container-low border border-outline-variant',
              'hover:bg-surface-container-high transition-all duration-300 ease-in-out cursor-pointer z-10',
              searchActive ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100',
            ].join(' ')}
            aria-label={t('searchPlaceholder')}
          >
            <span className="material-symbols-outlined text-lg">search</span>
          </button>

          {/* Expanded: input field — extends left from right edge */}
          <div
            className={[
              'absolute right-0 top-0 flex items-center h-10 bg-surface-container-low border border-outline-variant rounded-full overflow-hidden transition-all duration-300 ease-in-out',
              searchActive ? 'w-64 opacity-100 pointer-events-auto' : 'w-0 opacity-0 pointer-events-none',
            ].join(' ')}
          >
            <span className="material-symbols-outlined text-lg pl-3 text-on-surface-variant shrink-0">search</span>
            <input
              ref={searchInputRef}
              className="w-full h-full py-2 pr-3 pl-2 text-sm bg-transparent outline-none text-on-surface placeholder:text-on-surface-variant/70"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') deactivateSearch();
              }}
            />
            <button
              type="button"
              onClick={deactivateSearch}
              className="pr-3 text-on-surface-variant hover:text-on-surface transition-colors shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        <NotificationPopoverContainer />

        <div className="relative" ref={dropdownRef}>
          <div onClick={() => setDropdownOpen(!dropdownOpen)} className="cursor-pointer">
            <UserProfileAvatar size="sm" />
          </div>
        </div>
      </div>

      {/* Search dropdown — fixed to avoid overflow clipping */}
      {showSearchDropdown && (
        <div
          data-search-dropdown
          style={searchDropdownStyle}
          className="fixed z-[100] w-[380px] bg-surface border border-outline-variant rounded-xl shadow-lg overflow-hidden"
          onMouseDown={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <CommandList className="max-h-[400px] py-1">
              {renderResults()}
            </CommandList>
          </Command>
        </div>
      )}

      {/* User dropdown — fixed to avoid overflow clipping */}
      {dropdownOpen && (
        <div
          style={avatarDropdownStyle}
          className="fixed z-[100] w-48 bg-surface border border-outline-variant rounded-lg shadow-card py-1"
          onMouseDown={(e) => e.preventDefault()}
        >
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
    </header>
  );
}

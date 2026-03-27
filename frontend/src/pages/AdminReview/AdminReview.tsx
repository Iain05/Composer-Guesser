import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '@src/components/PageLayout';
import SearchDropdown from '@src/components/SearchDropdown';
import { useAuth } from '@src/context/AuthContext';
import {
  getExcerpts, getDailyChallenges,
  type ExcerptsPage, type ExcerptStatus, type SortOption, type DailyChallengesResponse,
} from '@src/api/admin';
import { getComposers, type ComposerSummary } from '@src/api/composer';
import { ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { STATUS_LABELS, ALL_STATUSES, SORT_LABELS } from './adminConstants';
import DraftCard from './DraftCard';

const PAGE_SIZE = 10;

const AdminReview: React.FC = () => {
  const { token, isAdmin } = useAuth();

  const [selectedStatuses, setSelectedStatuses] = useState<Set<ExcerptStatus>>(new Set(['DRAFT']));
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [composerQuery, setComposerQuery] = useState('');
  const [filterComposer, setFilterComposer] = useState<ComposerSummary | null>(null);
  const [sort, setSort] = useState<SortOption>('timesUsed_asc');

  const [dailyChallenges, setDailyChallenges] = useState<DailyChallengesResponse | null>(null);
  const [resultPage, setResultPage] = useState<ExcerptsPage | null>(null);
  const [composers, setComposers] = useState<ComposerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const loadPage = useCallback((statuses: ExcerptStatus[], composerId: number | null, sortOption: SortOption, pageIndex: number) => {
    if (!token) return;
    setLoading(true);
    setFetchError('');
    getExcerpts(token, statuses, composerId, sortOption, pageIndex, PAGE_SIZE)
      .then(p => setResultPage(p))
      .catch(e => setFetchError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    getComposers().then(setComposers).catch(() => { });
    getDailyChallenges(token).then(setDailyChallenges).catch(() => { });
    loadPage(['DRAFT'], null, 'timesUsed_asc', 0);
  }, [token, loadPage]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleStatus(s: ExcerptStatus) {
    if (selectedStatuses.has(s) && selectedStatuses.size === 1) return;
    const next = new Set(selectedStatuses);
    next.has(s) ? next.delete(s) : next.add(s);
    setSelectedStatuses(next);
    setCurrentPage(0);
    loadPage([...next], filterComposer?.composerId ?? null, sort, 0);
  }

  function handleFilterComposerSelect(c: ComposerSummary) {
    setFilterComposer(c);
    setComposerQuery(c.name);
    setCurrentPage(0);
    loadPage([...selectedStatuses], c.composerId, sort, 0);
  }

  function handleFilterComposerChange(val: string) {
    setComposerQuery(val);
    if (filterComposer && val !== filterComposer.name) {
      setFilterComposer(null);
      setCurrentPage(0);
      loadPage([...selectedStatuses], null, sort, 0);
    }
  }

  function clearFilterComposer() {
    setFilterComposer(null);
    setComposerQuery('');
    setCurrentPage(0);
    loadPage([...selectedStatuses], null, sort, 0);
  }

  function handleSortChange(newSort: SortOption) {
    setSort(newSort);
    setCurrentPage(0);
    loadPage([...selectedStatuses], filterComposer?.composerId ?? null, newSort, 0);
  }

  function handleStatusChanged() {
    loadPage([...selectedStatuses], filterComposer?.composerId ?? null, sort, currentPage);
  }

  function handleScheduled() {
    if (token) getDailyChallenges(token).then(setDailyChallenges).catch(() => { });
  }

  function goToPage(index: number) {
    setCurrentPage(index);
    loadPage([...selectedStatuses], filterComposer?.composerId ?? null, sort, index);
  }

  const statusDropdownLabel = selectedStatuses.size === ALL_STATUSES.length
    ? 'All statuses'
    : selectedStatuses.size === 1
      ? STATUS_LABELS[[...selectedStatuses][0]]
      : `${selectedStatuses.size} statuses`;

  const totalPages = resultPage?.totalPages ?? 0;
  const totalElements = resultPage?.totalElements ?? 0;

  const backLink = (
    <Link
      to="/"
      className="px-3 py-2 bg-surface border border-border text-ink-muted text-sm font-semibold rounded-xl shadow-sm hover:shadow-md hover:border-border-hover transition-all"
    >
      ← Back to game
    </Link>
  );

  if (!isAdmin) {
    return (
      <PageLayout leftSlot={backLink} title="Admin Review" subtitle="Excerpt management">
        <p className="text-ink-muted text-sm mt-8">You don't have permission to view this page.</p>
      </PageLayout>
    );
  }

  return (
    <PageLayout leftSlot={backLink} title="Admin Review" subtitle="Manage submitted excerpts">
      <main className="max-w-3xl w-full flex flex-col gap-4">

        {/* Daily challenge banner */}
        {dailyChallenges && (
          <div className="grid grid-cols-2 gap-3">
            {(['today', 'tomorrow'] as const).map(day => {
              const entry = dailyChallenges[day];
              return (
                <div key={day} className="p-3 bg-surface border border-border rounded-2xl flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-ink-muted tracking-wide">{day === 'today' ? 'Today' : 'Tomorrow'} - {entry?.submitterName}</span>
                  {entry ? (
                    <>
                      <span className="text-sm font-semibold text-ink truncate">{entry.excerptName}</span>
                      <span className="text-xs text-ink-muted">{entry.composerName}</span>
                      <span className="text-xs text-ink-subtle mt-0.5">Challenge #{entry.challengeNumber}</span>
                    </>
                  ) : (
                    <span className="text-sm text-ink-subtle italic">Not scheduled</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-stretch gap-3 p-3 bg-surface border border-border rounded-2xl">
          <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => setStatusDropdownOpen(v => !v)}
              className="flex items-center gap-2 px-4 h-full bg-canvas border-2 border-border text-ink text-sm font-semibold rounded-xl hover:border-border-hover transition-all"
            >
              <span>{statusDropdownLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
            </button>
            {statusDropdownOpen && (
              <div className="absolute z-20 top-full left-0 mt-1 bg-canvas border border-border rounded-xl shadow-lg py-1 min-w-[160px]">
                {ALL_STATUSES.map(s => (
                  <label
                    key={s}
                    className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-surface transition-colors"
                    onClick={e => { e.preventDefault(); toggleStatus(s); }}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedStatuses.has(s) ? 'bg-primary border-primary' : 'border-border'
                      }`}>
                      {selectedStatuses.has(s) && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-sm text-ink">{STATUS_LABELS[s]}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1">
            <SearchDropdown
              items={composers}
              getKey={c => c.composerId}
              getLabel={c => c.name}
              value={composerQuery}
              onChange={handleFilterComposerChange}
              onSelect={handleFilterComposerSelect}
              onClear={clearFilterComposer}
              selected={!!filterComposer}
              placeholder="All composers"
              icon="search"
            />
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-muted">Sort:</span>
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setSortDropdownOpen(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary/15 text-primary hover:bg-primary/25 transition-all"
            >
              {SORT_LABELS[sort]}
              <ChevronDown className="w-3 h-3" />
            </button>
            {sortDropdownOpen && (
              <div className="absolute z-20 top-full left-0 mt-1 bg-canvas border border-border rounded-xl shadow-lg py-1 min-w-[160px]">
                {(Object.keys(SORT_LABELS) as SortOption[]).map(opt => (
                  <button
                    key={opt}
                    onClick={() => { handleSortChange(opt); setSortDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-surface ${sort === opt ? 'text-primary font-semibold' : 'text-ink'
                      }`}
                  >
                    {SORT_LABELS[opt]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && fetchError && (
          <p className="text-red-500 text-sm text-center py-8">{fetchError}</p>
        )}

        {!loading && !fetchError && totalElements === 0 && (
          <div className="text-center py-16">
            <p className="text-2xl mb-2 text-green-600 dark:text-green-400">✓</p>
            <p className="text-ink font-semibold">No results</p>
          </div>
        )}

        {!loading && !fetchError && resultPage?.content.map(excerpt => (
          <DraftCard
            key={excerpt.excerptId}
            excerpt={excerpt}
            composers={composers}
            token={token!}
            tomorrowExcerptId={dailyChallenges?.tomorrow?.excerptId ?? null}
            onStatusChanged={handleStatusChanged}
            onScheduled={handleScheduled}
          />
        ))}

        {!loading && !fetchError && totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-ink-muted text-sm">
              Page {currentPage + 1} of {totalPages}
              <span className="text-ink-subtle ml-2">({totalElements} total)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="flex items-center gap-1 px-3 py-2 bg-surface border border-border text-ink text-sm font-semibold rounded-xl shadow-sm hover:shadow-md hover:border-border-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-2 bg-surface border border-border text-ink text-sm font-semibold rounded-xl shadow-sm hover:shadow-md hover:border-border-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </PageLayout>
  );
};

export default AdminReview;

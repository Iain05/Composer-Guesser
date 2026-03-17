import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getDailyLeaderboard,
  getAllTimeLeaderboard,
  type LeaderboardPage,
} from '@src/api/leaderboard';
import PageLayout from '@src/components/PageLayout';

type Tab = 'daily' | 'all-time';

const PAGE_SIZE = 50;

const Leaderboard: React.FC = () => {
  const [tab, setTab] = useState<Tab>('daily');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<LeaderboardPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetch = tab === 'daily'
      ? getDailyLeaderboard(page, PAGE_SIZE)
      : getAllTimeLeaderboard(page, PAGE_SIZE);
    fetch
      .then(setData)
      .catch(() => setError('Could not load leaderboard.'))
      .finally(() => setLoading(false));
  }, [tab, page]);

  function switchTab(next: Tab) {
    if (next === tab) return;
    setTab(next);
    setPage(0);
    setData(null);
  }

  const startRank = (data?.number ?? 0) * PAGE_SIZE + 1;

  const backLink = (
    <Link
      to="/"
      className="px-3 py-2 bg-surface border border-border text-ink-muted text-sm font-semibold rounded-xl shadow-sm hover:shadow-md hover:border-border-hover transition-all"
    >
      ← Back to game
    </Link>
  );

  return (
    <PageLayout
      leftSlot={backLink}
      title="Leaderboard"
      subtitle="Who's been listening closest?"
    >
      <main className="max-w-xl w-full flex flex-col gap-6">
        {/* Tab switcher */}
        <div className="flex rounded-xl overflow-hidden border-2 border-border">
          <button
            onClick={() => switchTab('daily')}
            className={`flex-1 py-2.5 font-semibold transition-colors ${
              tab === 'daily'
                ? 'bg-primary text-primary-text'
                : 'bg-surface text-ink-muted hover:bg-canvas'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => switchTab('all-time')}
            className={`flex-1 py-2.5 font-semibold transition-colors ${
              tab === 'all-time'
                ? 'bg-primary text-primary-text'
                : 'bg-surface text-ink-muted hover:bg-canvas'
            }`}
          >
            All-Time
          </button>
        </div>

        {/* Entries */}
        <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
          {loading && (
            <p className="text-center text-ink-muted py-10">Loading...</p>
          )}
          {error && (
            <p className="text-center text-red-500 py-10">{error}</p>
          )}
          {!loading && !error && data?.content.length === 0 && (
            <p className="text-center text-ink-subtle py-10 italic">
              No scores yet — be the first!
            </p>
          )}
          {!loading && !error && data && data.content.length > 0 && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-ink-subtle text-sm font-medium">
                  <th className="text-left py-3 px-5 w-10">#</th>
                  <th className="text-left py-3 px-5">Player</th>
                  <th className="text-right py-3 px-5">Points</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((entry, i) => {
                  const rank = startRank + i;
                  const isTop3 = rank <= 3;
                  return (
                    <tr
                      key={entry.username}
                      className="border-b border-border last:border-0 hover:bg-canvas transition-colors"
                    >
                      <td className="py-3.5 px-5 text-ink-subtle font-medium text-sm">
                        <span className="inline-block w-6 text-center">
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                        </span>
                      </td>
                      <td className={`py-3.5 px-5 font-semibold ${isTop3 ? 'text-ink' : 'text-ink-muted'}`}>
                        {entry.username}
                      </td>
                      <td className="py-3.5 px-5 text-right font-bold text-primary">
                        {entry.points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={data.first}
              className="px-4 py-2 bg-surface border border-border text-ink-muted text-sm font-semibold rounded-xl shadow-sm hover:shadow-md hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
            >
              ← Previous
            </button>
            <span className="text-ink-muted text-sm">
              Page {data.number + 1} of {data.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={data.last}
              className="px-4 py-2 bg-surface border border-border text-ink-muted text-sm font-semibold rounded-xl shadow-sm hover:shadow-md hover:border-border-hover disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </PageLayout>
  );
};

export default Leaderboard;

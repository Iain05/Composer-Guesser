import React, { useState } from 'react';
import HintCard from './HintCard';
import { MAX_GUESSES } from '@src/data/gameData';
import type { GuessResult } from '@src/api/guess';
import type { HintStatus } from '@src/types/game';
import { Copy, Check } from 'lucide-react';
import { buildShareText, copyToClipboard, type ShareData } from '@src/utils/shareScore';

interface GuessGridProps {
  guesses: GuessResult[];
  isGameOver?: boolean;
  shareData?: ShareData;
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

function formatNationality(code: string): string {
  return regionNames.of(code) ?? code;
}

const ERA_LABELS: Record<string, string> = {
  BAROQUE: 'Baroque',
  CLASSICAL: 'Classical',
  EARLY_ROMANTIC: 'Early Romantic',
  ROMANTIC: 'Romantic',
  LATE_ROMANTIC: 'Late Romantic',
  _20TH_CENTURY: '20th Century',
  MODERN: 'Modern',
};

function formatEra(era: string): string {
  return ERA_LABELS[era] ?? era;
}

function getYearText(birthYear: number, yearHint: GuessResult['yearHint']): string {
  if (yearHint === 'CORRECT') return String(birthYear);
  if (yearHint === 'TOO_LOW' || yearHint === 'CLOSE_LOW') return `${birthYear} ↑`;
  return `${birthYear} ↓`;
}

function getYearStatus(yearHint: GuessResult['yearHint']): HintStatus {
  if (yearHint === 'CORRECT') return 'CORRECT';
  if (yearHint === 'CLOSE_LOW' || yearHint === 'CLOSE_HIGH') return 'CLOSE';
  return 'WRONG';
}

const COLUMNS = ['Composer', 'Birth Year', 'Era', 'Nationality'];

const GuessGrid: React.FC<GuessGridProps> = ({ guesses, isGameOver, shareData }) => {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (!shareData) return;
    try {
      await copyToClipboard(buildShareText(shareData));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Share failed:', e);
    }
  }

  return (
    <div className="mt-2">
      <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-ink-subtle uppercase tracking-widest text-center">
        {COLUMNS.map((col) => (
          <div key={col}>{col}</div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: MAX_GUESSES }, (_, i) => {
          const guess = guesses[i];

          if (!guess) {
            return (
              <div key={i} className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }, (_, j) => (
                  <div key={j} className="guess-card bg-surface border-2 border-border" />
                ))}
              </div>
            );
          }

          return (
            <div key={i} className="grid grid-cols-4 gap-2">
              <HintCard text={guess.composerName} status={guess.composerHint} />
              <HintCard
                text={getYearText(guess.birthYear, guess.yearHint)}
                status={getYearStatus(guess.yearHint)}
              />
              <HintCard text={formatEra(guess.era)} status={guess.eraHint as HintStatus} />
              <HintCard text={formatNationality(guess.nationality)} status={guess.nationalityHint} />
            </div>
          );
        })}
      </div>

      {isGameOver && shareData && (
        <button
          onClick={handleShare}
          className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-surface border border-border text-ink text-sm font-semibold rounded-xl shadow-sm hover:shadow-md hover:border-border-hover transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Share your score'}
        </button>
      )}
    </div>
  );
};

export default GuessGrid;

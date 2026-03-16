import React from 'react';
import HintCard from './HintCard';
import { MAX_GUESSES } from '@src/data/gameData';
import type { GuessResult } from '@src/api/guess';
import type { HintStatus } from '@src/types/game';

interface GuessGridProps {
  guesses: GuessResult[];
}

function getYearText(birthYear: number, yearHint: GuessResult['yearHint']): string {
  if (yearHint === 'CORRECT') return String(birthYear);
  return yearHint === 'TOO_LOW' ? `${birthYear} ↑` : `${birthYear} ↓`;
}

const COLUMNS = ['Composer', 'Birth Year', 'Era', 'Nationality'];

const GuessGrid: React.FC<GuessGridProps> = ({ guesses }) => {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-4 gap-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
        {COLUMNS.map((col) => (
          <div key={col}>{col}</div>
        ))}
      </div>

      <div className="flex flex-col gap-2 min-h-[400px]">
        {Array.from({ length: MAX_GUESSES }, (_, i) => {
          const guess = guesses[i];

          if (!guess) {
            return (
              <div key={i} className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }, (_, j) => (
                  <div key={j} className="bg-white border-2 border-slate-100 rounded-xl h-16" />
                ))}
              </div>
            );
          }

          const lastName = guess.composerName.split(' ').slice(-1)[0];

          return (
            <div key={i} className="grid grid-cols-4 gap-2">
              <HintCard text={lastName} status={guess.composerHint} />
              <HintCard
                text={getYearText(guess.birthYear, guess.yearHint)}
                status={guess.yearHint === 'CORRECT' ? 'correct' : 'wrong'}
              />
              <HintCard text={guess.era} status={guess.eraHint as HintStatus} />
              <HintCard text={guess.nationality} status={guess.nationalityHint} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuessGrid;

import React from 'react';
import HintCard from './HintCard';
import { COMPOSERS, ERAS, MAX_GUESSES } from '@src/data/gameData';
import type { Guess, Piece, HintStatus } from '@src/types/game';

interface GuessGridProps {
  guesses: Guess[];
  targetPiece: Piece;
}

function getEraStatus(guessEra: string, targetEra: string): HintStatus {
  if (guessEra === targetEra) return 'correct';
  const guessIdx = ERAS.indexOf(guessEra as (typeof ERAS)[number]);
  const targetIdx = ERAS.indexOf(targetEra as (typeof ERAS)[number]);
  return Math.abs(guessIdx - targetIdx) === 1 ? 'close' : 'wrong';
}

function getYearText(guessYear: number, targetYear: number): string {
  if (guessYear === targetYear) return String(guessYear);
  return guessYear < targetYear ? `${guessYear} ↑` : `${guessYear} ↓`;
}

const COLUMNS = ['Composer', 'Year', 'Era', 'Nationality', 'Genre'];

const GuessGrid: React.FC<GuessGridProps> = ({ guesses, targetPiece }) => {
  const targetComposer = COMPOSERS.find((c) => c.name === targetPiece.composer);

  return (
    <div className="mt-4">
      <div className="grid grid-cols-5 gap-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
        {COLUMNS.map((col) => (
          <div key={col}>{col}</div>
        ))}
      </div>

      <div className="flex flex-col gap-2 min-h-[400px]">
        {Array.from({ length: MAX_GUESSES }, (_, i) => {
          const guess = guesses[i];

          if (!guess || !targetComposer) {
            return (
              <div key={i} className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }, (_, j) => (
                  <div
                    key={j}
                    className="bg-white border-2 border-slate-100 rounded-xl h-16"
                  />
                ))}
              </div>
            );
          }

          return (
            <div key={i} className="grid grid-cols-5 gap-2">
              <HintCard
                text={guess.name.split(' ').slice(-1)[0]}
                status={guess.name === targetComposer.name ? 'correct' : 'wrong'}
              />
              <HintCard
                text={getYearText(guess.year, targetComposer.year)}
                status={guess.year === targetComposer.year ? 'correct' : 'wrong'}
              />
              <HintCard
                text={guess.era}
                status={getEraStatus(guess.era, targetComposer.era)}
              />
              <HintCard
                text={guess.nationality}
                status={guess.nationality === targetComposer.nationality ? 'correct' : 'wrong'}
              />
              <HintCard
                text={guess.genreGuessed}
                status={guess.genreGuessed === targetPiece.genre ? 'correct' : 'wrong'}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GuessGrid;

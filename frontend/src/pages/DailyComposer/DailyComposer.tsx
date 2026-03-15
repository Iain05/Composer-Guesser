import React, { useState, useEffect } from 'react';
import AudioPlayer from '@src/components/AudioPlayer';
import GuessControls from '@src/components/GuessControls';
import GuessGrid from '@src/components/GuessGrid';
import GameStatus from '@src/components/GameStatus';
import { useGameState } from '@src/hooks/useGameState';
import { getDailyChallenge } from '@src/api/excerpt';
import { getComposers, type ComposerSummary } from '@src/api/composer';

const DailyComposer: React.FC = () => {
  const { targetPiece, guesses, isGameOver, gameKey, won, submitGuess, resetGame } =
    useGameState();

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [composers, setComposers] = useState<ComposerSummary[]>([]);

  useEffect(() => {
    getDailyChallenge().then(setAudioUrl).catch(console.error);
    getComposers().then(setComposers).catch(console.error);
  }, []);

  return (
    <>
      <header className="text-center mb-8 max-w-2xl w-full">
        <h1 className="serif text-4xl font-bold mb-2 text-slate-900">Daily Composer</h1>
        <p className="text-slate-600 italic">Identify who composed this musical excerpt!</p>
      </header>

      <main className="max-w-xl w-full flex flex-col gap-6">
        <AudioPlayer key={gameKey} disabled={isGameOver} audioUrl={audioUrl} />

        <GuessControls disabled={isGameOver} composers={composers} onSubmit={(composer) => submitGuess(composer)} />

        <GuessGrid guesses={guesses} targetPiece={targetPiece} />

        {isGameOver && (
          <GameStatus won={won} targetPiece={targetPiece} onPlayAgain={resetGame} />
        )}
      </main>
    </>
  );
};

export default DailyComposer;

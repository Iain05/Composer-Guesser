import { useState, useCallback } from 'react';
import { MAX_GUESSES } from '@src/data/gameData';
import { submitGuess as submitGuessApi, type GuessResult } from '@src/api/guess';

export function useGameState(excerptId: number | null) {
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [gameKey, setGameKey] = useState(0);

  const won = guesses.some((g) => g.correct);
  const isGameOver = won || guesses.length >= MAX_GUESSES;

  const submitGuess = useCallback(async (composerId: number): Promise<boolean> => {
    if (!excerptId || isGameOver) return false;
    try {
      const result = await submitGuessApi(excerptId, composerId);
      setGuesses((prev) => [...prev, result]);
      return true;
    } catch {
      return false;
    }
  }, [excerptId, isGameOver]);

  const resetGame = useCallback(() => {
    setGuesses([]);
    setGameKey((k) => k + 1);
  }, []);

  const lastGuess = guesses[guesses.length - 1];

  return { guesses, isGameOver, gameKey, won, lastGuess, submitGuess, resetGame };
}

import { useState, useCallback } from 'react';
import { COMPOSERS, PIECES, MAX_GUESSES } from '@src/data/gameData';
import type { Piece, Guess } from '@src/types/game';

interface GameState {
  targetPiece: Piece;
  guesses: Guess[];
  isGameOver: boolean;
  gameKey: number;
}

function pickRandomPiece(): Piece {
  return PIECES[Math.floor(Math.random() * PIECES.length)];
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => ({
    targetPiece: pickRandomPiece(),
    guesses: [],
    isGameOver: false,
    gameKey: 0,
  }));

  const submitGuess = useCallback((composerName: string, genreName: string): boolean => {
    const composerObj = COMPOSERS.find((c) => c.name === composerName);
    if (!composerObj || !genreName) return false;

    setState((prev) => {
      if (prev.isGameOver) return prev;

      const guess: Guess = { ...composerObj, genreGuessed: genreName };
      const newGuesses = [...prev.guesses, guess];
      const won =
        composerObj.name === prev.targetPiece.composer &&
        genreName === prev.targetPiece.genre;
      const isGameOver = won || newGuesses.length >= MAX_GUESSES;

      return { ...prev, guesses: newGuesses, isGameOver };
    });

    return true;
  }, []);

  const resetGame = useCallback(() => {
    setState((prev) => ({
      targetPiece: pickRandomPiece(),
      guesses: [],
      isGameOver: false,
      gameKey: prev.gameKey + 1,
    }));
  }, []);

  const lastGuess = state.guesses[state.guesses.length - 1];
  const won =
    state.isGameOver &&
    !!lastGuess &&
    lastGuess.name === state.targetPiece.composer &&
    lastGuess.genreGuessed === state.targetPiece.genre;

  return {
    targetPiece: state.targetPiece,
    guesses: state.guesses,
    isGameOver: state.isGameOver,
    gameKey: state.gameKey,
    won,
    submitGuess,
    resetGame,
  };
}

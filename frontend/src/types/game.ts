export interface Composer {
  name: string;
  year: number;
  era: string;
  nationality: string;
}

export interface Piece {
  title: string;
  composer: string;
  clue: string;
}

export type HintStatus = 'correct' | 'close' | 'wrong';

export type Guess = Composer;

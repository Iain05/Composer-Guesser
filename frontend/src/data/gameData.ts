import type { Composer, Piece } from '@src/types/game';

export const ERAS = [
  'Renaissance',
  'Baroque',
  'Classical',
  'Romantic',
  'Modern',
  'Contemporary',
] as const;

export const MAX_PLAYS = 3;
export const MAX_GUESSES = 5;
export const PIECE_DURATION = 135; // 2:15 in seconds

export const COMPOSERS: Composer[] = [
  { name: 'Johann Sebastian Bach', year: 1685, era: 'Baroque', nationality: 'German' },
  { name: 'Wolfgang Amadeus Mozart', year: 1756, era: 'Classical', nationality: 'Austrian' },
  { name: 'Ludwig van Beethoven', year: 1770, era: 'Classical', nationality: 'German' },
  { name: 'Frédéric Chopin', year: 1810, era: 'Romantic', nationality: 'Polish' },
  { name: 'Pyotr Ilyich Tchaikovsky', year: 1840, era: 'Romantic', nationality: 'Russian' },
  { name: 'Claude Debussy', year: 1862, era: 'Modern', nationality: 'French' },
  { name: 'Igor Stravinsky', year: 1882, era: 'Modern', nationality: 'Russian' },
  { name: 'Antonio Vivaldi', year: 1678, era: 'Baroque', nationality: 'Italian' },
  { name: 'George Frideric Handel', year: 1685, era: 'Baroque', nationality: 'German' },
  { name: 'Franz Liszt', year: 1811, era: 'Romantic', nationality: 'Hungarian' },
  { name: 'Johannes Brahms', year: 1833, era: 'Romantic', nationality: 'German' },
  { name: 'Richard Wagner', year: 1813, era: 'Romantic', nationality: 'German' },
  { name: 'Franz Schubert', year: 1797, era: 'Classical', nationality: 'Austrian' },
  { name: 'Giuseppe Verdi', year: 1813, era: 'Romantic', nationality: 'Italian' },
];

export const PIECES: Piece[] = [
  {
    title: 'Symphony No. 5',
    composer: 'Ludwig van Beethoven',
    clue: "Four iconic opening notes: 'Short-short-short-long' in C minor.",
  },
  {
    title: 'The Four Seasons',
    composer: 'Antonio Vivaldi',
    clue: 'A set of four violin concertos depicting spring, summer, autumn, and winter.',
  },
  {
    title: 'Brandenburg Concertos',
    composer: 'Johann Sebastian Bach',
    clue: 'A collection of six instrumental works often cited as the pinnacle of Baroque polyphony.',
  },
  {
    title: 'The Nutcracker',
    composer: 'Pyotr Ilyich Tchaikovsky',
    clue: "A world-famous holiday ballet featuring the 'Dance of the Sugar Plum Fairy'.",
  },
  {
    title: 'Nocturne Op. 9 No. 2',
    composer: 'Frédéric Chopin',
    clue: "A tender, lyrical piano piece that epitomizes the Romantic 'song without words' style.",
  },
  {
    title: 'The Rite of Spring',
    composer: 'Igor Stravinsky',
    clue: 'A revolutionary work that caused a riot at its premiere due to its primal rhythms.',
  },
  {
    title: 'Requiem',
    composer: 'Wolfgang Amadeus Mozart',
    clue: "A haunting final masterpiece left unfinished at the composer's death.",
  },
];

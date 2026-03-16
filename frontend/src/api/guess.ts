export interface GuessResult {
  correct: boolean;
  composerName: string;
  birthYear: number;
  era: string;
  nationality: string;
  composerHint: 'correct' | 'wrong';
  yearHint: 'CORRECT' | 'TOO_LOW' | 'TOO_HIGH';
  eraHint: 'correct' | 'close' | 'wrong';
  nationalityHint: 'correct' | 'wrong';
  pieceTitle: string;
  targetComposerName: string;
}

export async function submitGuess(excerptId: number, composerId: number): Promise<GuessResult> {
  const res = await fetch('/api/guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ excerptId, composerId }),
  });
  if (!res.ok) throw new Error('Failed to submit guess');
  return res.json();
}

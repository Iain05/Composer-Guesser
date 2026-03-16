export interface DailyChallenge {
  excerptId: number;
  audioUrl: string;
}

export async function getDailyChallenge(): Promise<DailyChallenge> {
  const res = await fetch('/api/excerpt/daily-challenge');
  if (!res.ok) throw new Error('No daily challenge found');
  return res.json();
}

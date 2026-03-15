export async function getDailyChallenge(): Promise<string> {
  const res = await fetch('/api/excerpt/daily-challenge');
  if (!res.ok) throw new Error('No daily challenge found');
  return res.text();
}

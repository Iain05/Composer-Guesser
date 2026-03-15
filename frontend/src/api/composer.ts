export interface ComposerSummary {
  composerId: number;
  name: string;
}

export async function getComposers(): Promise<ComposerSummary[]> {
  const res = await fetch('/api/composers');
  if (!res.ok) throw new Error('Failed to fetch composers');
  return res.json();
}

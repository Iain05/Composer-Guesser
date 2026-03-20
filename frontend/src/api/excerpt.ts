export interface DailyChallenge {
  excerptId: number;
  audioUrl: string;
  challengeNumber: number | null;
  date: string | null;
}

export async function getDailyChallenge(): Promise<DailyChallenge> {
  const res = await fetch('/api/excerpt/daily-challenge');
  if (!res.ok) throw new Error('No daily challenge found');
  return res.json();
}

export async function submitExcerpt(
  audioBlob: Blob,
  composerId: number,
  workId: number | null,
  title: string,
  compositionYear: number | null,
  description: string,
  token: string,
): Promise<void> {
  const form = new FormData();
  form.append('audio', audioBlob, 'excerpt.wav');
  form.append('composerId', String(composerId));
  if (workId != null) form.append('workId', String(workId));
  form.append('title', title);
  if (compositionYear != null) form.append('compositionYear', String(compositionYear));
  if (description) form.append('description', description);

  const res = await fetch('/api/excerpt/submit', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Upload failed — please try again');
  }
}

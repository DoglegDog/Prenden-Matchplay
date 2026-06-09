import { Tournament } from './types';
import INITIAL_TOURNAMENT from './data';

const KV_KEY = 'matchplay_2026';

// Try Vercel KV; fall back to in-memory for local dev
let memStore: Tournament | null = null;

export async function loadTournament(): Promise<Tournament> {
  try {
    const { kv } = await import('@vercel/kv');
    const data = await kv.get<Tournament>(KV_KEY);
    if (!data) return INITIAL_TOURNAMENT;
    // Merge prelims for old stored data that predates the prelims field
    return { ...data, prelims: data.prelims ?? INITIAL_TOURNAMENT.prelims };
  } catch {
    const data = memStore;
    if (!data) return INITIAL_TOURNAMENT;
    return { ...data, prelims: data.prelims ?? INITIAL_TOURNAMENT.prelims };
  }
}

export async function saveTournament(data: Tournament): Promise<void> {
  try {
    const { kv } = await import('@vercel/kv');
    await kv.set(KV_KEY, data);
  } catch {
    memStore = data;
  }
}

export async function resetTournament(): Promise<Tournament> {
  const fresh = JSON.parse(JSON.stringify(INITIAL_TOURNAMENT)) as Tournament;
  await saveTournament(fresh);
  return fresh;
}

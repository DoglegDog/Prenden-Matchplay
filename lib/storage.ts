import { Tournament } from './types';
import INITIAL_TOURNAMENT from './data';

const KV_KEY = 'matchplay_2026';

// Try Vercel KV; fall back to in-memory for local dev
let memStore: Tournament | null = null;

export async function loadTournament(): Promise<Tournament> {
  try {
    const { kv } = await import('@vercel/kv');
    const data = await kv.get<Tournament>(KV_KEY);
    return data ?? INITIAL_TOURNAMENT;
  } catch {
    return memStore ?? INITIAL_TOURNAMENT;
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

import { NextRequest, NextResponse } from 'next/server';
import { loadTournament, saveTournament, resetTournament } from '@/lib/storage';
import { advanceWinner, clearWinner, setMatchMeta, setPrelimWinner, clearPrelimWinner } from '@/lib/data';

export async function GET() {
  const data = await loadTournament();
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, matchId, winner, password } = body;

  const adminPw = process.env.ADMIN_PASSWORD ?? 'prenden2026';
  if (password !== adminPw) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (action === 'ping') {
    return NextResponse.json({ ok: true });
  }

  if (action === 'reset') {
    const scope: 'team' | 'einzel' | 'all' = body.scope ?? 'all';
    const current = await loadTournament();
    const fresh = await resetTournament(scope, current);
    return NextResponse.json(fresh);
  }

  if (action === 'setWinner' && matchId && winner) {
    const current = await loadTournament();
    const updated = advanceWinner(current, matchId, winner);
    await saveTournament(updated);
    return NextResponse.json(updated);
  }

  if (action === 'clearWinner' && matchId) {
    const current = await loadTournament();
    const updated = clearWinner(current, matchId);
    await saveTournament(updated);
    return NextResponse.json(updated);
  }

  if (action === 'setPrelimWinner' && body.prelimId && body.winner) {
    const current = await loadTournament();
    const updated = setPrelimWinner(current, body.prelimId, body.winner);
    await saveTournament(updated);
    return NextResponse.json(updated);
  }

  if (action === 'clearPrelimWinner' && body.prelimId) {
    const current = await loadTournament();
    const updated = clearPrelimWinner(current, body.prelimId);
    await saveTournament(updated);
    return NextResponse.json(updated);
  }

  if (action === 'setMatchMeta' && matchId) {
    const current = await loadTournament();
    const updated = setMatchMeta(current, matchId, body.result ?? null, body.scheduledDate ?? null);
    await saveTournament(updated);
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

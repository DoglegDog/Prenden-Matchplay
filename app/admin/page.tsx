'use client';
import { useState, useEffect } from 'react';
import { Tournament } from '@/lib/types';
import TournamentView from '@/components/TournamentView';
import { TEAM_ROUND_DATES, TEAM_ROUND_MODES, EINZEL_ROUND_DATES } from '@/lib/data';

type Tab = 'team' | 'einzel';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [pwError, setPwError] = useState('');
  const [tab, setTab] = useState<Tab>('team');
  const [data, setData] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(false);

  async function login() {
    setLoading(true);
    const res = await fetch('/api/bracket');
    if (res.ok) {
      // Verify password by trying a no-op
      const verify = await fetch('/api/bracket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping', password }),
      });
      if (verify.status === 401) {
        setPwError('Falsches Passwort');
        setLoading(false);
        return;
      }
      const tournament = await res.json();
      setData(tournament);
      setAuthed(true);
    }
    setLoading(false);
  }

  async function setWinner(matchId: string, winner: string) {
    const res = await fetch('/api/bracket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setWinner', matchId, winner, password }),
    });
    if (res.ok) setData(await res.json());
  }

  async function setMeta(matchId: string, result: string, scheduledDate: string) {
    const res = await fetch('/api/bracket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setMatchMeta', matchId, result, scheduledDate, password }),
    });
    if (res.ok) setData(await res.json());
  }

  async function reset() {
    if (!confirm('Wirklich alles zurücksetzen? Alle Ergebnisse werden gelöscht.')) return;
    const res = await fetch('/api/bracket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset', password }),
    });
    if (res.ok) setData(await res.json());
  }

  if (!authed) {
    return (
      <div>
        <div className="hero-bg" />
        <div className="page-content pw-screen">
          <div className="pw-card">
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Admin-Bereich</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
              Matchplay 2026 – Golf Club Berlin-Prenden
            </div>
            <input
              className="pw-input"
              type="password"
              placeholder="Passwort"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
            />
            {pwError && <div className="pw-error">{pwError}</div>}
            <button className="pw-btn" onClick={login} disabled={loading}>
              {loading ? 'Laden…' : 'Anmelden'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="hero-bg" />
      <div className="page-content">
        <header className="site-header">
          <div>
            <div className="site-title">Matchplay 2026 – Admin</div>
            <div className="site-subtitle">Golf Club Berlin-Prenden</div>
          </div>
        </header>

        <div className="action-bar">
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            Klicke auf den Gewinner, um ihn weiterzusetzten
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="/" style={{ padding: '6px 14px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
              ← Zur Übersicht
            </a>
            <button className="reset-btn" onClick={reset}>Alles zurücksetzen</button>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className="tabs">
            <button className={`tab-btn ${tab === 'team' ? 'active' : ''}`} onClick={() => setTab('team')}>
              Team-Matchplay
            </button>
            <button className={`tab-btn ${tab === 'einzel' ? 'active' : ''}`} onClick={() => setTab('einzel')}>
              Einzel-Matchplay
            </button>
          </div>
        </div>

        {tab === 'team' && (
          <TournamentView
            bracket={data.team}
            roundDates={TEAM_ROUND_DATES}
            roundModes={TEAM_ROUND_MODES}
            adminMode={true}
            onSetWinner={setWinner}
            onSetMeta={setMeta}
          />
        )}
        {tab === 'einzel' && (
          <TournamentView
            bracket={data.einzel}
            roundDates={EINZEL_ROUND_DATES}
            adminMode={true}
            onSetWinner={setWinner}
            onSetMeta={setMeta}
          />
        )}
      </div>
    </div>
  );
}

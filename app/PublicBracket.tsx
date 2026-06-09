'use client';
import { useState } from 'react';
import { Tournament } from '@/lib/types';
import TournamentView from '@/components/TournamentView';
import { TEAM_ROUND_DATES, TEAM_ROUND_MODES, EINZEL_ROUND_DATES } from '@/lib/data';

type Tab = 'team' | 'einzel';

export default function PublicBracket({ initialData }: { initialData: Tournament }) {
  const [tab, setTab] = useState<Tab>('team');

  return (
    <div>
      <div className="hero-bg" />
      <div className="page-content">
        <header className="site-header">
          <img src="/prenden-logo.png" alt="Golf Club Berlin-Prenden" className="site-logo" />
          <div>
            <div className="site-title">Matchplay 2026</div>
            <div className="site-subtitle">Golf Club Berlin-Prenden</div>
          </div>
        </header>

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
            bracket={initialData.team}
            roundDates={TEAM_ROUND_DATES}
            roundModes={TEAM_ROUND_MODES}
          />
        )}
        {tab === 'einzel' && (
          <TournamentView
            bracket={initialData.einzel}
            roundDates={EINZEL_ROUND_DATES}
          />
        )}
      </div>
    </div>
  );
}

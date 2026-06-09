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
            prelims={initialData.prelims ?? []}
          />
        )}

        <footer className="gfd-footer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://www.greenfee-deals.de/logo-light.svg" alt="GreenfeeDeals" className="gfd-footer-logo" />
          <div className="gfd-footer-text">
            Mit freundlicher Unterstützung von{' '}
            <a href="https://www.greenfee-deals.de" target="_blank" rel="noopener noreferrer">GreenfeeDeals</a>
            {' '}– dein Durchblick im Greenfee-Dschungel
          </div>
        </footer>
      </div>
    </div>
  );
}

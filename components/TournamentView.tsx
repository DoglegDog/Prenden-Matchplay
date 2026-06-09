'use client';
import { TournamentBracket } from '@/lib/types';
import BracketSide from './BracketSide';
import BracketMatch from './BracketMatch';

interface Props {
  bracket: TournamentBracket;
  roundDates: Record<string, string>;
  roundModes?: Record<string, string>;
  adminMode?: boolean;
  onSetWinner?: (matchId: string, winner: string) => void;
  onClearWinner?: (matchId: string) => void;
  onSetMeta?: (matchId: string, result: string, scheduledDate: string) => void;
}

// Must match BracketSide constants exactly
const ROUND_W = 190;
const COL_GAP = 32;
const SIDE_GAP = 16; // gap between bracket side and center column

const ROUNDS_L = ['r1', 'r2', 'r3', 'r4'] as const;
const ROUND_LABELS = ['1. Runde', 'Achtelfinale', 'Viertelfinale', 'Halbfinale'];

export default function TournamentView({ bracket, roundDates, roundModes, adminMode, onSetWinner, onClearWinner, onSetMeta }: Props) {
  const leftRounds = ROUNDS_L;
  const rightRounds = [...ROUNDS_L].reverse();
  const rightLabels = [...ROUND_LABELS].reverse();
  const rightKeys = ['r4', 'r3', 'r2', 'r1'] as const;

  return (
    <div style={{ overflowX: 'auto', padding: '8px 24px 40px' }}>
      {/* ── Header row — exact same flex structure as bracket row ── */}
      <div style={{ display: 'flex', gap: SIDE_GAP, marginBottom: 10, alignItems: 'flex-end' }}>
        {/* Left headers */}
        <div style={{ display: 'flex', gap: COL_GAP, flexShrink: 0 }}>
          {leftRounds.map((rk, i) => (
            <div key={rk} style={{ width: ROUND_W, textAlign: 'center', flexShrink: 0 }}>
              <div className="round-label">{ROUND_LABELS[i]}</div>
              {roundModes && <div className="round-mode">{roundModes[rk]}</div>}
              <div className="round-date">{roundDates[rk]}</div>
            </div>
          ))}
        </div>

        {/* Center header */}
        <div style={{ width: 200, flexShrink: 0, textAlign: 'center' }}>
          <div className="round-label" style={{ color: '#4ade80' }}>Finale</div>
          {roundModes && <div className="round-mode">{roundModes['final']}</div>}
          <div className="round-date">{roundDates['final']}</div>
        </div>

        {/* Right headers */}
        <div style={{ display: 'flex', gap: COL_GAP, flexShrink: 0 }}>
          {rightRounds.map((rk, i) => (
            <div key={rk} style={{ width: ROUND_W, textAlign: 'center', flexShrink: 0 }}>
              <div className="round-label">{rightLabels[i]}</div>
              {roundModes && <div className="round-mode">{roundModes[rightKeys[i]]}</div>}
              <div className="round-date">{roundDates[rightKeys[i]]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bracket row ── */}
      <div style={{ display: 'flex', gap: SIDE_GAP, alignItems: 'center' }}>
        <BracketSide side={bracket.left} adminMode={adminMode} onSetWinner={onSetWinner} onClearWinner={onClearWinner} onSetMeta={onSetMeta} />

        {/* Center: Finale + 3. Platz */}
        <div className="center-column">
          <div>
            <div className="center-label">Finale</div>
            <div className="finale-match-wrapper">
              <BracketMatch match={bracket.final} adminMode={adminMode} onSetWinner={onSetWinner} onClearWinner={onClearWinner} onSetMeta={onSetMeta} />
            </div>
          </div>
          <div>
            <div className="center-label">3. Platz</div>
            <div className="finale-match-wrapper">
              <BracketMatch match={bracket.third} adminMode={adminMode} onSetWinner={onSetWinner} onClearWinner={onClearWinner} onSetMeta={onSetMeta} />
            </div>
          </div>
        </div>

        <BracketSide side={bracket.right} mirror adminMode={adminMode} onSetWinner={onSetWinner} onClearWinner={onClearWinner} onSetMeta={onSetMeta} />
      </div>
    </div>
  );
}

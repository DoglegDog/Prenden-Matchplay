'use client';
import { useRef, useState, useEffect } from 'react';
import { TournamentBracket, PrelimMatch } from '@/lib/types';
import BracketSide from './BracketSide';
import BracketMatch from './BracketMatch';

interface Props {
  bracket: TournamentBracket;
  roundDates: Record<string, string>;
  roundModes?: Record<string, string>;
  prelims?: PrelimMatch[];
  adminMode?: boolean;
  onSetWinner?: (matchId: string, winner: string) => void;
  onClearWinner?: (matchId: string) => void;
  onSetPrelimWinner?: (prelimId: string, winner: string) => void;
  onClearPrelimWinner?: (prelimId: string) => void;
  onSetMeta?: (matchId: string, result: string, scheduledDate: string) => void;
}

// Must match BracketSide constants exactly
const ROUND_W = 190;
const COL_GAP = 32;
const SIDE_GAP = 16;
const PADDING = 24;
const SLOT = 82;       // MATCH_H(76) + GAP(6)
const TOTAL_H = 8 * SLOT; // 656px
const BRACKET_SIDE_W = 4 * ROUND_W + 3 * COL_GAP; // 856px
const NATURAL_W = 2 * BRACKET_SIDE_W + 200 + 2 * SIDE_GAP + 2 * PADDING; // 1992px

function matchTop(roundIdx: number, matchIdx: number) {
  const slotsPerMatch = Math.pow(2, roundIdx);
  return matchIdx * slotsPerMatch * SLOT + ((slotsPerMatch - 1) / 2) * SLOT;
}

// r3 = Viertelfinale (roundIdx 2)
const FINALE_TOP = matchTop(2, 0);  // 123px — oberes Viertelfinale
const THIRD_TOP  = matchTop(2, 1);  // 451px — unteres Viertelfinale

const ROUNDS_L = ['r1', 'r2', 'r3', 'r4'] as const;
const ROUND_LABELS = ['1. Runde', 'Achtelfinale', 'Viertelfinale', 'Halbfinale'];

export default function TournamentView({ bracket, roundDates, roundModes, prelims, adminMode, onSetWinner, onClearWinner, onSetPrelimWinner, onClearPrelimWinner, onSetMeta }: Props) {
  const leftRounds = ROUNDS_L;
  const rightRounds = [...ROUNDS_L].reverse();
  const rightLabels = [...ROUND_LABELS].reverse();
  const rightKeys = ['r4', 'r3', 'r2', 'r1'] as const;

  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      setScale(w > 0 ? Math.min(1, w / NATURAL_W) : 1);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    // Outer: misst die verfügbare Breite, kein overflow
    <div ref={outerRef} style={{ overflow: 'hidden', paddingTop: 8, paddingBottom: 40 }}>
      {/* Inneres Div: skaliert den gesamten Bracket-Inhalt */}
      <div style={{
        width: NATURAL_W,
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        // Höhe des skalierten Inhalts für den äußeren Container reservieren
        marginBottom: `calc((${TOTAL_H + 80}px * ${scale}) - ${TOTAL_H + 80}px)`,
        padding: `0 ${PADDING}px`,
        boxSizing: 'border-box',
      }}>
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
      <div style={{ display: 'flex', gap: SIDE_GAP, alignItems: 'flex-start' }}>
        <BracketSide side={bracket.left} adminMode={adminMode} prelims={prelims} onSetWinner={onSetWinner} onClearWinner={onClearWinner} onSetPrelimWinner={onSetPrelimWinner} onClearPrelimWinner={onClearPrelimWinner} onSetMeta={onSetMeta} />

        {/* Center: Finale + 3. Platz — absolut positioniert auf Viertelfinale-Höhe */}
        <div style={{ position: 'relative', width: 200, height: TOTAL_H, flexShrink: 0 }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: FINALE_TOP - 22 }}>
            <div className="center-label finale-center-label">
              <span className="trophy-icon">🏆</span> Finale
            </div>
            <div className="finale-match-wrapper">
              <BracketMatch match={bracket.final} adminMode={adminMode} onSetWinner={onSetWinner} onClearWinner={onClearWinner} onSetMeta={onSetMeta} />
            </div>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: THIRD_TOP - 18 }}>
            <div className="center-label third-center-label">
              <span className="bronze-icon">🥉</span> 3. Platz
            </div>
            <div className="third-match-wrapper">
              <BracketMatch match={bracket.third} adminMode={adminMode} onSetWinner={onSetWinner} onClearWinner={onClearWinner} onSetMeta={onSetMeta} />
            </div>
          </div>
        </div>

        <BracketSide side={bracket.right} mirror adminMode={adminMode} prelims={prelims} onSetWinner={onSetWinner} onClearWinner={onClearWinner} onSetPrelimWinner={onSetPrelimWinner} onClearPrelimWinner={onClearPrelimWinner} onSetMeta={onSetMeta} />
      </div>
      </div>{/* end inner padding wrapper */}
    </div>
  );
}

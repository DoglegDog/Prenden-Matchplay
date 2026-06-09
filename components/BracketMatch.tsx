'use client';
import { useState, useRef, useEffect } from 'react';
import { Match, PrelimMatch } from '@/lib/types';

interface Props {
  match: Match;
  prelimP1?: PrelimMatch | null;
  prelimP2?: PrelimMatch | null;
  adminMode?: boolean;
  onSetWinner?: (matchId: string, winner: string) => void;
  onClearWinner?: (matchId: string) => void;
  onSetPrelimWinner?: (prelimId: string, winner: string) => void;
  onClearPrelimWinner?: (prelimId: string) => void;
  onSetMeta?: (matchId: string, result: string, scheduledDate: string) => void;
}

export default function BracketMatch({
  match, prelimP1, prelimP2, adminMode,
  onSetWinner, onClearWinner,
  onSetPrelimWinner, onClearPrelimWinner,
  onSetMeta,
}: Props) {
  const isDone = !!match.winner;
  const canPlay = adminMode && match.p1 && match.p2 && !isDone;
  const [editing, setEditing] = useState(false);
  const [localResult, setLocalResult] = useState(match.result ?? '');
  const [localDate, setLocalDate] = useState(match.scheduledDate ?? '');
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalResult(match.result ?? '');
    setLocalDate(match.scheduledDate ?? '');
  }, [match.result, match.scheduledDate]);

  useEffect(() => {
    if (!editing) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setEditing(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editing]);

  function saveMeta() {
    onSetMeta?.(match.id, localResult.trim(), localDate.trim());
    setEditing(false);
  }

  // Render a split slot for an undecided prelim (both candidates visible)
  function renderPrelimSlot(prelim: PrelimMatch, topBorder: boolean) {
    const decided = !!prelim.winner; // should not happen here but guard anyway
    if (decided) return null;

    return (
      <div
        key="prelim-split"
        className={['player-slot', 'prelim-split-slot', topBorder ? 'border-b border-white/10' : ''].join(' ')}
      >
        {[prelim.p1, prelim.p2].map((name, hi) => (
          <div
            key={hi}
            className={[
              'prelim-half',
              hi === 0 ? 'prelim-half-top' : '',
              adminMode ? 'prelim-half-clickable' : '',
            ].join(' ')}
            onClick={() => adminMode && onSetPrelimWinner?.(prelim.id, name)}
            title={adminMode ? `${name} gewinnt Vorrunde` : undefined}
          >
            <span className="prelim-half-name">{name}</span>
          </div>
        ))}
      </div>
    );
  }

  // Render a normal player slot
  function renderPlayerSlot(player: string | null, idx: number, prelim?: PrelimMatch | null) {
    const isWinner = isDone && player === match.winner;
    const isLoser  = isDone && player !== match.winner && player !== null;
    const clickable = canPlay && !!player;
    const undoable  = adminMode && isWinner && !!onClearWinner;

    function handleClick() {
      if (undoable)              { onClearWinner!(match.id); return; }
      if (clickable && player)   { onSetWinner?.(match.id, player); return; }
    }

    const title = undoable ? 'Klicken zum Zurücksetzen' : undefined;

    return (
      <div
        key={idx}
        className={[
          'player-slot',
          idx === 0 ? 'border-b border-white/10' : '',
          isWinner ? 'winner' : '',
          isLoser  ? 'loser'  : '',
          clickable || undoable ? 'clickable' : '',
          // Subtle indicator that this slot came from a prelim
          prelim?.winner ? 'prelim-decided' : '',
        ].join(' ')}
        onClick={handleClick}
        title={title}
      >
        <span className="player-name">
          {player ?? <span className="text-white/25 italic text-xs">–</span>}
        </span>
        {isWinner && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            {match.result && <span className="match-result-badge">{match.result}</span>}
            <span style={{ color: '#4ade80', fontSize: 11, fontWeight: 700 }}>✓</span>
          </span>
        )}
      </div>
    );
  }

  const prelims = [prelimP1, prelimP2];

  return (
    <div className="match-card-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className="match-card">
        <div className="match-date-row">{match.scheduledDate || ''}</div>

        {[match.p1, match.p2].map((player, idx) => {
          const prelim = prelims[idx];
          // Show split slot when player is null and prelim is unresolved
          if (player === null && prelim && !prelim.winner) {
            return renderPrelimSlot(prelim, idx === 0);
          }
          return renderPlayerSlot(player, idx, prelim ?? null);
        })}
      </div>

      {adminMode && (
        <button
          className="match-edit-btn"
          onClick={e => { e.stopPropagation(); setEditing(v => !v); }}
          title="Datum / Ergebnis bearbeiten"
        >✎</button>
      )}

      {editing && (
        <div ref={popoverRef} className="match-edit-popover" onClick={e => e.stopPropagation()}>
          <div className="meta-input-row">
            <label>📅 Datum</label>
            <input className="meta-input" placeholder="z.B. 17.6." value={localDate}
              onChange={e => setLocalDate(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveMeta()} />
          </div>
          <div className="meta-input-row">
            <label>🏌️ Ergebnis</label>
            <input className="meta-input" placeholder="z.B. 4&3" value={localResult}
              onChange={e => setLocalResult(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveMeta()} />
          </div>
          <button className="meta-save-btn" onClick={saveMeta}>Speichern</button>
          {/* Vorrunde zurücksetzen — nur wenn Prelim entschieden und r1 noch unberührt */}
          {[prelimP1, prelimP2].map((prelim, i) =>
            prelim?.winner && !isDone ? (
              <button key={i} className="meta-prelim-reset-btn" onClick={() => {
                onClearPrelimWinner?.(prelim.id);
                setEditing(false);
              }}>
                ↩ Vorrunde zurücksetzen ({prelim.p1} / {prelim.p2})
              </button>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';
import { Match } from '@/lib/types';

interface Props {
  match: Match;
  adminMode?: boolean;
  onSetWinner?: (matchId: string, winner: string) => void;
  onClearWinner?: (matchId: string) => void;
  onSetMeta?: (matchId: string, result: string, scheduledDate: string) => void;
}

export default function BracketMatch({ match, adminMode, onSetWinner, onClearWinner, onSetMeta }: Props) {
  const canPlay = adminMode && match.p1 && match.p2 && !match.winner;
  const isDone = !!match.winner;
  const [editing, setEditing] = useState(false);
  const [localResult, setLocalResult] = useState(match.result ?? '');
  const [localDate, setLocalDate] = useState(match.scheduledDate ?? '');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync local state when match updates from parent
  useEffect(() => {
    setLocalResult(match.result ?? '');
    setLocalDate(match.scheduledDate ?? '');
  }, [match.result, match.scheduledDate]);

  // Close on outside click
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

  return (
    <div className="match-card-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className="match-card">
        {/* Date row — always reserves space so card height stays stable */}
        <div className="match-date-row">
          {match.scheduledDate || ''}
        </div>
        {[match.p1, match.p2].map((player, idx) => {
          const isWinner = isDone && player === match.winner;
          const isLoser = isDone && player !== match.winner && player !== null;
          const clickable = canPlay && !!player;
          const undoable = adminMode && isWinner && !!onClearWinner;

          function handleClick() {
            if (undoable) { onClearWinner!(match.id); return; }
            if (clickable && player) onSetWinner?.(match.id, player);
          }

          return (
            <div
              key={idx}
              className={[
                'player-slot',
                idx === 0 ? 'border-b border-white/10' : '',
                isWinner ? 'winner' : '',
                isLoser ? 'loser' : '',
                clickable || undoable ? 'clickable' : '',
              ].join(' ')}
              onClick={handleClick}
              title={undoable ? 'Klicken zum Zurücksetzen' : undefined}
            >
              <span className="player-name">
                {player ?? <span className="text-white/25 italic text-xs">–</span>}
              </span>
              {isWinner && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                  {match.result && (
                    <span className="match-result-badge">{match.result}</span>
                  )}
                  <span style={{ color: '#4ade80', fontSize: 11, fontWeight: 700 }}>✓</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin edit button */}
      {adminMode && (
        <button
          className="match-edit-btn"
          onClick={e => { e.stopPropagation(); setEditing(v => !v); }}
          title="Datum / Ergebnis bearbeiten"
        >
          ✎
        </button>
      )}

      {/* Edit popover */}
      {editing && (
        <div ref={popoverRef} className="match-edit-popover" onClick={e => e.stopPropagation()}>
          <div className="meta-input-row">
            <label>📅 Datum</label>
            <input
              className="meta-input"
              placeholder="z.B. 17.6."
              value={localDate}
              onChange={e => setLocalDate(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveMeta()}
            />
          </div>
          <div className="meta-input-row">
            <label>🏌️ Ergebnis</label>
            <input
              className="meta-input"
              placeholder="z.B. 4&3"
              value={localResult}
              onChange={e => setLocalResult(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveMeta()}
            />
          </div>
          <button className="meta-save-btn" onClick={saveMeta}>Speichern</button>
        </div>
      )}
    </div>
  );
}

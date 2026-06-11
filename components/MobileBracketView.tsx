'use client';
import { useState, useEffect } from 'react';
import { Match, PrelimMatch, TournamentBracket, Tournament } from '@/lib/types';

type SideRound = 'r1' | 'r2' | 'r3' | 'r4';
type RoundKey  = SideRound | 'final';

const ROUNDS: RoundKey[] = ['r1', 'r2', 'r3', 'r4', 'final'];

const ROUND_LABELS: Record<RoundKey, string> = {
  r1:    '1. Runde',
  r2:    'Achtelfinale',
  r3:    'Viertelfinale',
  r4:    'Halbfinale',
  final: 'Finale',
};

// Number of matches per bracket side per round
const PER_SIDE: Record<SideRound, number> = { r1: 8, r2: 4, r3: 2, r4: 1 };
const PREV_ROUND: Record<SideRound, SideRound | null> = { r1: null, r2: 'r1', r3: 'r2', r4: 'r3' };

// Global 1-based match number within a round (left side: 1…N, right side: N+1…2N)
function globalNum(side: 'left' | 'right', idx: number, round: SideRound): number {
  return (side === 'right' ? PER_SIDE[round] : 0) + idx + 1;
}

// Build "Sieger M5" / "Verlierer M2" placeholder label
function placeholder(
  side: 'left' | 'right',
  matchIdx: number,
  slot: 0 | 1,
  prevRound: SideRound | null,
  kind: 'Sieger' | 'Verlierer' = 'Sieger',
): string {
  if (!prevRound) return '–';
  const prevMi = matchIdx * 2 + slot;
  return `${kind} M${globalNum(side, prevMi, prevRound)}`;
}

interface MobileMatchInfo {
  match:    Match;
  matchNum: number;
  p1Label:  string;
  p2Label:  string;
  prelim1:  PrelimMatch | null;
  prelim2:  PrelimMatch | null;
  isThird?: boolean;
  isFinale?: boolean;
}

function buildMatchList(
  bracket: TournamentBracket,
  round: RoundKey,
  prelims: PrelimMatch[],
): MobileMatchInfo[] {
  if (round === 'final') {
    const fin = bracket.final;
    const thr = bracket.third;
    return [
      {
        match: fin, matchNum: 1, isFinale: true, prelim1: null, prelim2: null,
        p1Label: fin.p1 ?? 'Sieger M1',
        p2Label: fin.p2 ?? 'Sieger M2',
      },
      {
        match: thr, matchNum: 2, isThird: true, prelim1: null, prelim2: null,
        p1Label: thr.p1 ?? 'Verlierer M1',
        p2Label: thr.p2 ?? 'Verlierer M2',
      },
    ];
  }

  const sideRound = round as SideRound;
  const prevRound = PREV_ROUND[sideRound];
  const result: MobileMatchInfo[] = [];

  for (const side of ['left', 'right'] as const) {
    const matches = bracket[side][sideRound] as Match[];
    matches.forEach((match, mi) => {
      const prelim1 = prelims.find(p => p.matchId === match.id && p.slot === 'p1') ?? null;
      const prelim2 = prelims.find(p => p.matchId === match.id && p.slot === 'p2') ?? null;

      const p1Label =
        match.p1 !== null ? match.p1
        : prelim1 && !prelim1.winner ? `${prelim1.p1} / ${prelim1.p2}`
        : placeholder(side, mi, 0, prevRound);

      const p2Label =
        match.p2 !== null ? match.p2
        : prelim2 && !prelim2.winner ? `${prelim2.p1} / ${prelim2.p2}`
        : placeholder(side, mi, 1, prevRound);

      result.push({
        match,
        matchNum: globalNum(side, mi, sideRound),
        p1Label, p2Label, prelim1, prelim2,
      });
    });
  }

  return result;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  tournament:        Tournament;
  teamRoundDates:    Record<string, string>;
  teamRoundModes:    Record<string, string>;
  einzelRoundDates:  Record<string, string>;
  adminMode?:        boolean;
  onSetWinner?:      (matchId: string, winner: string) => void;
  onClearWinner?:    (matchId: string) => void;
  onSetPrelimWinner?:(prelimId: string, winner: string) => void;
  onClearPrelimWinner?:(prelimId: string) => void;
  onSetMeta?:        (matchId: string, result: string, scheduledDate: string) => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MobileBracketView({
  tournament,
  teamRoundDates,
  teamRoundModes,
  einzelRoundDates,
  adminMode,
  onSetWinner,
  onClearWinner,
  onSetPrelimWinner,
  onClearPrelimWinner,
  onSetMeta,
}: Props) {
  const [tab,      setTab]      = useState<'team' | 'einzel'>('team');
  const [roundIdx, setRoundIdx] = useState(0);

  const currentRound = ROUNDS[roundIdx];
  const bracket      = tab === 'team' ? tournament.team : tournament.einzel;
  const roundDates   = tab === 'team' ? teamRoundDates  : einzelRoundDates;
  const roundModes   = tab === 'team' ? teamRoundModes  : undefined;
  const prelims      = tournament.prelims ?? [];
  const matches      = buildMatchList(bracket, currentRound, prelims);
  const roundDate    = roundDates[currentRound] ?? '';
  const roundMode    = roundModes?.[currentRound] ?? '';

  const canPrev = roundIdx > 0;
  const canNext = roundIdx < ROUNDS.length - 1;

  const navBtn = (enabled: boolean): React.CSSProperties => ({
    width: 40, height: 40, borderRadius: 8, border: 'none', flexShrink: 0,
    background: enabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
    color: enabled ? 'white' : 'rgba(255,255,255,0.18)',
    fontSize: '1.25rem', fontWeight: 700,
    cursor: enabled ? 'pointer' : 'default',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    lineHeight: 1,
  });

  return (
    <div style={{ padding: '0 14px 48px' }}>

      {/* ── Team / Einzel toggle ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['team', 'einzel'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
            fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            background: tab === t ? '#4ade80' : 'rgba(255,255,255,0.07)',
            color:      tab === t ? '#0a1a0a' : 'rgba(255,255,255,0.55)',
          }}>
            {t === 'team' ? 'Team-Matchplay' : 'Einzel-Matchplay'}
          </button>
        ))}
      </div>

      {/* ── Round navigation ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
        <button onClick={() => canPrev && setRoundIdx(i => i - 1)} style={navBtn(canPrev)}>‹</button>

        <div style={{ flex: 1 }}>
          <div style={{ position: 'relative' }}>
            <select
              value={currentRound}
              onChange={e => setRoundIdx(ROUNDS.indexOf(e.target.value as RoundKey))}
              style={{
                width: '100%', padding: '10px 36px 10px 14px',
                borderRadius: 8, border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.06)', color: 'white',
                fontSize: '0.95rem', fontWeight: 700,
                WebkitAppearance: 'none', appearance: 'none',
                cursor: 'pointer', outline: 'none',
              }}
            >
              {ROUNDS.map(r => (
                <option key={r} value={r} style={{ background: '#1a1a2e', color: 'white' }}>
                  {ROUND_LABELS[r]}
                </option>
              ))}
            </select>
            <span style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              pointerEvents: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem',
            }}>▾</span>
          </div>
          {(roundDate || roundMode) && (
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', marginTop: 5, paddingLeft: 2 }}>
              {[roundMode, roundDate].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>

        <button onClick={() => canNext && setRoundIdx(i => i + 1)} style={navBtn(canNext)}>›</button>
      </div>

      {/* ── Match cards ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {currentRound === 'final' && (
          <div style={{ textAlign: 'center', padding: '4px 0 8px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            🏆 Finale &amp; 3. Platz
          </div>
        )}
        {matches.map(info => (
          <MobileMatchCard
            key={info.match.id}
            info={info}
            adminMode={adminMode}
            onSetWinner={onSetWinner}
            onClearWinner={onClearWinner}
            onSetPrelimWinner={onSetPrelimWinner}
            onClearPrelimWinner={onClearPrelimWinner}
            onSetMeta={onSetMeta}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Mobile Match Card ────────────────────────────────────────────────────────

interface CardProps {
  info:                 MobileMatchInfo;
  adminMode?:           boolean;
  onSetWinner?:         (matchId: string, winner: string) => void;
  onClearWinner?:       (matchId: string) => void;
  onSetPrelimWinner?:   (prelimId: string, winner: string) => void;
  onClearPrelimWinner?: (prelimId: string) => void;
  onSetMeta?:           (matchId: string, result: string, scheduledDate: string) => void;
}

function MobileMatchCard({ info, adminMode, onSetWinner, onClearWinner, onSetPrelimWinner, onClearPrelimWinner, onSetMeta }: CardProps) {
  const { match, matchNum, p1Label, p2Label, prelim1, prelim2, isThird, isFinale } = info;
  const isDone   = !!match.winner;
  const canPlay  = adminMode && match.p1 && match.p2 && !isDone;
  const [editing, setEditing] = useState(false);
  const [localResult, setLocalResult] = useState(match.result ?? '');
  const [localDate,   setLocalDate]   = useState(match.scheduledDate ?? '');

  useEffect(() => {
    setLocalResult(match.result ?? '');
    setLocalDate(match.scheduledDate ?? '');
  }, [match.result, match.scheduledDate]);

  function saveMeta() {
    onSetMeta?.(match.id, localResult.trim(), localDate.trim());
    setEditing(false);
  }

  const accentColor = isFinale ? '#4ade80' : isThird ? '#cd7f32' : 'rgba(255,255,255,0.18)';
  const headerLabel = isFinale ? '🏆 Finale' : isThird ? '🥉 3. Platz' : `Match ${matchNum}`;

  const players = [
    { player: match.p1, label: p1Label, prelim: prelim1 },
    { player: match.p2, label: p2Label, prelim: prelim2 },
  ];

  return (
    <div style={{
      borderRadius: 10,
      border: `1px solid ${isDone ? 'rgba(74,222,128,0.2)' : accentColor}`,
      background: isDone ? 'rgba(74,222,128,0.03)' : 'rgba(255,255,255,0.03)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 12px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <span style={{
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
          color: isFinale ? '#4ade80' : isThird ? '#cd7f32' : 'rgba(255,255,255,0.35)',
        }}>
          {headerLabel}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {match.scheduledDate && (
            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>📅 {match.scheduledDate}</span>
          )}
          {adminMode && (
            <button onClick={() => setEditing(v => !v)} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer', fontSize: '0.8rem', padding: '1px 4px',
            }}>✎</button>
          )}
        </div>
      </div>

      {/* Player rows */}
      {players.map(({ player, label, prelim }, idx) => {
        const isWinner     = isDone && player === match.winner;
        const isLoser      = isDone && player !== match.winner && player !== null;
        const isPlaceholder = player === null && !(prelim && !prelim.winner);
        const isPrelimOpen  = player === null && prelim && !prelim.winner;
        const clickable    = canPlay && !!player;
        const undoable     = adminMode && isWinner;

        return (
          <div key={idx}>
            <div
              onClick={() => {
                if (undoable) { onClearWinner?.(match.id); return; }
                if (clickable && player) onSetWinner?.(match.id, player);
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '11px 14px',
                borderTop: idx === 1 ? '1px solid rgba(255,255,255,0.07)' : undefined,
                background: isWinner ? 'rgba(74,222,128,0.07)' : 'transparent',
                cursor: clickable || undoable ? 'pointer' : 'default',
                opacity: isLoser ? 0.38 : 1,
              }}
            >
              <span style={{
                fontSize: '0.9rem', fontWeight: isWinner ? 700 : 500,
                color: isWinner ? '#4ade80' : isPlaceholder ? 'rgba(255,255,255,0.18)' : isPrelimOpen ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.88)',
                fontStyle: isPlaceholder ? 'italic' : 'normal',
                flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {label}
              </span>
              {isWinner && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginLeft: 8 }}>
                  {match.result && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(74,222,128,0.15)', color: '#4ade80', borderRadius: 4, padding: '2px 7px' }}>
                      {match.result}
                    </span>
                  )}
                  <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.9rem' }}>✓</span>
                </span>
              )}
              {canPlay && !isDone && player && (
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.18)', flexShrink: 0, marginLeft: 8 }}>Tippen</span>
              )}
            </div>

            {/* Unresolved prelim: show both candidates as tap targets in admin */}
            {isPrelimOpen && adminMode && (
              <div style={{
                display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)',
                borderBottom: idx === 0 ? '1px solid rgba(255,255,255,0.07)' : undefined,
              }}>
                {[prelim!.p1, prelim!.p2].map(name => (
                  <button key={name} onClick={() => onSetPrelimWinner?.(prelim!.id, name)} style={{
                    flex: 1, padding: '8px 0', background: 'rgba(129,140,248,0.07)',
                    border: 'none', color: 'rgba(255,255,255,0.55)',
                    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Edit panel (admin) */}
      {editing && (
        <div style={{
          padding: '10px 14px 14px',
          background: 'rgba(255,255,255,0.03)',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {[
            { icon: '📅', label: 'Datum',    val: localDate,   set: setLocalDate,   ph: 'z.B. 17.6.' },
            { icon: '🏌️', label: 'Ergebnis', val: localResult, set: setLocalResult, ph: 'z.B. 4&3'   },
          ].map(({ icon, label, val, set, ph }) => (
            <div key={label} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <label style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', minWidth: 60 }}>{icon} {label}</label>
              <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
                onKeyDown={e => e.key === 'Enter' && saveMeta()}
                style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: '0.85rem', outline: 'none' }} />
            </div>
          ))}
          <button onClick={saveMeta} style={{
            padding: '8px', borderRadius: 6, border: 'none',
            background: 'rgba(74,222,128,0.18)', color: '#4ade80',
            fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem',
          }}>
            Speichern
          </button>
          {/* Prelim reset buttons */}
          {[prelim1, prelim2].map((prelim, i) =>
            prelim?.winner && !isDone ? (
              <button key={i} onClick={() => { onClearPrelimWinner?.(prelim.id); setEditing(false); }} style={{
                padding: '7px', borderRadius: 6, border: 'none',
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)',
                fontSize: '0.78rem', cursor: 'pointer',
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

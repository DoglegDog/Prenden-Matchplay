'use client';
import { Side, Match } from '@/lib/types';
import BracketMatch from './BracketMatch';

interface Props {
  side: Side;
  mirror?: boolean;
  adminMode?: boolean;
  onSetWinner?: (matchId: string, winner: string) => void;
  onClearWinner?: (matchId: string) => void;
  onSetMeta?: (matchId: string, result: string, scheduledDate: string) => void;
}

const MATCH_H = 62;  // px height per match card
const GAP = 6;       // px gap between match cards in R1
const SLOT = MATCH_H + GAP; // 68px per R1 slot

const ROUNDS: Array<keyof Side> = ['r1', 'r2', 'r3', 'r4'];
const ROUND_W = 158;
const COL_GAP = 32;

function matchTop(roundIdx: number, matchIdx: number): number {
  const slotsPerMatch = Math.pow(2, roundIdx);
  const groupStart = matchIdx * slotsPerMatch * SLOT;
  const offset = ((slotsPerMatch - 1) / 2) * SLOT;
  return groupStart + offset;
}


export default function BracketSide({ side, mirror = false, adminMode, onSetWinner, onClearWinner, onSetMeta }: Props) {
  const totalHeight = 8 * SLOT;
  const totalWidth = ROUNDS.length * ROUND_W + (ROUNDS.length - 1) * COL_GAP;

  return (
    <div className="relative" style={{ width: totalWidth, height: totalHeight, flexShrink: 0 }}>
      {/* SVG connecting lines */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={totalWidth}
        height={totalHeight}
        style={{ zIndex: 0 }}
      >
        {ROUNDS.map((_, ri) => {
          if (ri === 0) return null;
          const matchCount = Math.pow(2, ROUNDS.length - 1 - ri);
          return Array.from({ length: matchCount }, (__, mi) => {
            const colX = mirror
              ? totalWidth - (ri + 1) * ROUND_W - ri * COL_GAP
              : ri * (ROUND_W + COL_GAP);

            const prevColX = mirror
              ? totalWidth - ri * ROUND_W - (ri - 1) * COL_GAP
              : (ri - 1) * (ROUND_W + COL_GAP);

            const prevR = ri - 1;
            const childA = mi * 2;
            const childB = mi * 2 + 1;
            const yA = matchTop(prevR, childA) + MATCH_H / 2;
            const yB = matchTop(prevR, childB) + MATCH_H / 2;
            const yMid = (yA + yB) / 2;

            const xFrom = mirror ? prevColX : prevColX + ROUND_W;
            const xTo = mirror ? colX + ROUND_W : colX;
            const xMid = (xFrom + xTo) / 2;

            return (
              <path
                key={`${ri}-${mi}`}
                d={`M ${xFrom} ${yA} H ${xMid} V ${yB} M ${xMid} ${yMid} H ${xTo}`}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1.5"
                fill="none"
              />
            );
          });
        })}
      </svg>

      {/* Match cards per round */}
      {ROUNDS.map((round, ri) => {
        const matches = side[round] as Match[];
        const colX = mirror
          ? totalWidth - (ri + 1) * ROUND_W - ri * COL_GAP
          : ri * (ROUND_W + COL_GAP);

        return matches.map((match, mi) => {
          const top = matchTop(ri, mi);
          return (
            <div
              key={match.id}
              className="absolute"
              style={{ left: colX, top, width: ROUND_W, height: MATCH_H }}
            >
              <BracketMatch
                match={match}
                adminMode={adminMode}
                onSetWinner={onSetWinner}
                onClearWinner={onClearWinner}
                onSetMeta={onSetMeta}
              />
            </div>
          );
        });
      })}
    </div>
  );
}

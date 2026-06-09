'use client';
import { Match } from '@/lib/types';

interface Props {
  match: Match;
  adminMode?: boolean;
  onSetWinner?: (matchId: string, winner: string) => void;
}

export default function BracketMatch({ match, adminMode, onSetWinner }: Props) {
  const canPlay = adminMode && match.p1 && match.p2 && !match.winner;
  const isDone = !!match.winner;

  return (
    <div className="match-card">
      {[match.p1, match.p2].map((player, idx) => {
        const isWinner = isDone && player === match.winner;
        const isLoser = isDone && player !== match.winner;
        const clickable = canPlay && !!player;

        return (
          <div
            key={idx}
            className={[
              'player-slot',
              idx === 0 ? 'border-b border-white/10' : '',
              isWinner ? 'winner' : '',
              isLoser ? 'loser' : '',
              clickable ? 'clickable' : '',
            ].join(' ')}
            onClick={() => clickable && player && onSetWinner?.(match.id, player)}
          >
            <span className="player-name">
              {player ?? <span className="text-white/25 italic text-xs">–</span>}
            </span>
            {isWinner && <span className="ml-1 text-green-400 text-xs font-bold">✓</span>}
          </div>
        );
      })}
    </div>
  );
}

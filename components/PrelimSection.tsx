'use client';
import { PrelimMatch } from '@/lib/types';

interface Props {
  prelims: PrelimMatch[];
  adminMode?: boolean;
  onSetWinner?: (prelimId: string, winner: string) => void;
  onClearWinner?: (prelimId: string) => void;
}

export default function PrelimSection({ prelims, adminMode, onSetWinner, onClearWinner }: Props) {
  if (!prelims.length) return null;

  return (
    <div className="prelim-section">
      <div className="prelim-header">
        <span className="prelim-title">Vorrunde</span>
        <span className="prelim-subtitle">Gewinner qualifiziert sich für die 1. Runde</span>
      </div>
      <div className="prelim-cards">
        {prelims.map(prelim => {
          const isDone = !!prelim.winner;
          return (
            <div key={prelim.id} className="prelim-card">
              {[prelim.p1, prelim.p2].map((player, idx) => {
                const isWinner = isDone && player === prelim.winner;
                const isLoser  = isDone && player !== prelim.winner;
                const clickable = adminMode && !isDone;
                const undoable  = adminMode && isWinner;

                function handleClick() {
                  if (undoable) { onClearWinner?.(prelim.id); return; }
                  if (clickable) onSetWinner?.(prelim.id, player);
                }

                return (
                  <div
                    key={idx}
                    className={[
                      'prelim-slot',
                      idx === 0 ? 'prelim-slot-top' : '',
                      isWinner ? 'prelim-winner' : '',
                      isLoser  ? 'prelim-loser'  : '',
                      clickable || undoable ? 'prelim-clickable' : '',
                    ].join(' ')}
                    onClick={handleClick}
                    title={undoable ? 'Klicken zum Zurücksetzen' : undefined}
                  >
                    <span className="prelim-name">{player}</span>
                    {isWinner && <span className="prelim-check">✓</span>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

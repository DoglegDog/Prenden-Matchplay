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
}

const ROUND_LABELS = ['1. Runde', 'Achtelfinale', 'Viertelfinale', 'Halbfinale'];

export default function TournamentView({ bracket, roundDates, roundModes, adminMode, onSetWinner }: Props) {
  return (
    <div className="tournament-wrapper">
      {/* Round headers */}
      <div className="round-headers">
        {/* Left side headers (outside → in) */}
        {ROUND_LABELS.map((label, i) => (
          <div key={`lh-${i}`} className="round-header">
            <div className="round-label">{label}</div>
            {roundModes && <div className="round-mode">{roundModes[['r1','r2','r3','r4'][i]]}</div>}
            <div className="round-date">{roundDates[['r1','r2','r3','r4'][i]]}</div>
          </div>
        ))}

        {/* Center: Finale */}
        <div className="round-header center-header">
          <div className="round-label text-red-400 font-bold">Finale</div>
          {roundModes && <div className="round-mode">{roundModes['final']}</div>}
          <div className="round-date">{roundDates['final']}</div>
        </div>

        {/* Right side headers (in → outside) */}
        {[...ROUND_LABELS].reverse().map((label, i) => (
          <div key={`rh-${i}`} className="round-header">
            <div className="round-label">{label}</div>
            {roundModes && <div className="round-mode">{roundModes[['r4','r3','r2','r1'][i]]}</div>}
            <div className="round-date">{roundDates[['r4','r3','r2','r1'][i]]}</div>
          </div>
        ))}
      </div>

      {/* Bracket area */}
      <div className="bracket-area">
        <BracketSide
          side={bracket.left}
          adminMode={adminMode}
          onSetWinner={onSetWinner}
        />

        {/* Center column: Finale + 3. Platz */}
        <div className="center-column">
          <div className="finale-box">
            <div className="text-xs text-white/50 uppercase tracking-widest mb-2 text-center">Finale</div>
            <BracketMatch
              match={bracket.final}
              adminMode={adminMode}
              onSetWinner={onSetWinner}
            />
          </div>
          <div className="mt-6">
            <div className="text-xs text-white/50 uppercase tracking-widest mb-2 text-center">3. Platz</div>
            <BracketMatch
              match={bracket.third}
              adminMode={adminMode}
              onSetWinner={onSetWinner}
            />
          </div>
        </div>

        <BracketSide
          side={bracket.right}
          mirror={true}
          adminMode={adminMode}
          onSetWinner={onSetWinner}
        />
      </div>
    </div>
  );
}

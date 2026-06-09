export interface Match {
  id: string;
  p1: string | null;
  p2: string | null;
  winner: string | null;
  loser: string | null;
  date?: string | null;
  result?: string | null;       // e.g. "4&3"
  scheduledDate?: string | null; // e.g. "17.6."
}

export interface Side {
  r1: Match[];
  r2: Match[];
  r3: Match[];
  r4: Match[];
}

export interface TournamentBracket {
  left: Side;
  right: Side;
  final: Match;
  third: Match;
}

export interface PrelimMatch {
  id: string;
  matchId: string;   // welches r1-Match wird befüllt
  slot: 'p1' | 'p2'; // welcher Slot des r1-Matches
  p1: string;
  p2: string;
  winner: string | null;
}

export interface Tournament {
  team: TournamentBracket;
  einzel: TournamentBracket;
  prelims: PrelimMatch[];
}

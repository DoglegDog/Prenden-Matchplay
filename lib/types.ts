export interface Match {
  id: string;
  p1: string | null;
  p2: string | null;
  winner: string | null;
  loser: string | null;
  date?: string | null;
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

export interface Tournament {
  team: TournamentBracket;
  einzel: TournamentBracket;
}

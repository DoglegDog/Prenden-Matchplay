import { Match, Side, Tournament, TournamentBracket } from './types';

function m(id: string, p1: string | null = null, p2: string | null = null): Match {
  return { id, p1, p2, winner: null, loser: null, date: null };
}

function emptySide(prefix: string): Side {
  return {
    r1: Array.from({ length: 8 }, (_, i) => m(`${prefix}_r1_${i}`)),
    r2: Array.from({ length: 4 }, (_, i) => m(`${prefix}_r2_${i}`)),
    r3: Array.from({ length: 2 }, (_, i) => m(`${prefix}_r3_${i}`)),
    r4: [m(`${prefix}_r4_0`)],
  };
}

export const ROUND_NAMES: Record<string, string> = {
  r1: '1. Runde',
  r2: 'Achtelfinale',
  r3: 'Viertelfinale',
  r4: 'Halbfinale',
};

export const TEAM_ROUND_DATES: Record<string, string> = {
  r1: '19.4. – 31.5.',
  r2: '1.6. – 5.7.',
  r3: '6.7. – 9.8.',
  r4: '10.8. – 6.9.',
  final: '7.9. – 19.10.',
};

export const TEAM_ROUND_MODES: Record<string, string> = {
  r1: 'Scramble',
  r2: 'Bestball',
  r3: 'Chapman',
  r4: 'Greensome',
  final: 'Klassischer Vierer',
};

export const EINZEL_ROUND_DATES: Record<string, string> = {
  r1: 'bis 24.5.',
  r2: 'bis 28.6.',
  r3: 'bis 26.7.',
  r4: 'bis 30.8.',
  final: 'bis 11.10.',
};

const INITIAL_TOURNAMENT: Tournament = {
  team: {
    left: {
      r1: [
        m('tl_r1_0', 'Lenz / Lenz', 'Nicklas / Eisenhart'),
        m('tl_r1_1', 'Ruffert / Ruffert', 'Melzig / Grzeskowitz'),
        m('tl_r1_2', 'Streckfuss / Schulenburg', 'Stein / Hundt'),
        m('tl_r1_3', 'Hansen / Bartz', 'Hirsch / Schönwald'),
        m('tl_r1_4', 'Weber / Kühn', 'Buttke / Hänel'),
        m('tl_r1_5', 'Spahic / Grützke', 'Kinne / Kuske'),
        m('tl_r1_6', 'Lüker / Sawinski', 'Heck / Heck'),
        m('tl_r1_7', 'Höfs / Tiede', 'Roberts / Dankers'),
      ],
      r2: Array.from({ length: 4 }, (_, i) => m(`tl_r2_${i}`)),
      r3: Array.from({ length: 2 }, (_, i) => m(`tl_r3_${i}`)),
      r4: [m('tl_r4_0')],
    },
    right: {
      r1: [
        m('tr_r1_0', 'Nguyen / Khoi', 'Wieters / Jany'),
        m('tr_r1_1', 'Dreyer / Seelig', 'Hintz / Grützmann'),
        m('tr_r1_2', 'Müller / Herder', 'Geppert / Möller'),
        m('tr_r1_3', 'Müller / Kaelcke', 'Haubold / Vogeler'),
        m('tr_r1_4', 'Fiebing / Güres', 'Scheetz / Stäger'),
        m('tr_r1_5', 'Radtke / Mrosack', 'Ogden / Schißau'),
        m('tr_r1_6', 'Licht / Dannehl', 'Lemke / Barsin'),
        m('tr_r1_7', 'Grossmann / Borde', 'Waibel / Römer'),
      ],
      r2: Array.from({ length: 4 }, (_, i) => m(`tr_r2_${i}`)),
      r3: Array.from({ length: 2 }, (_, i) => m(`tr_r3_${i}`)),
      r4: [m('tr_r4_0')],
    },
    final: m('team_final'),
    third: m('team_third'),
  },
  einzel: {
    left: {
      r1: [
        m('el_r1_0', 'Dannehl', 'Grützmann'),
        m('el_r1_1', 'Mittmann', 'Wicklund'),
        m('el_r1_2', 'Königbauer', 'Weber'),
        m('el_r1_3', 'Buttke', 'Fischer'),
        m('el_r1_4', 'Hänel', 'L. Wieters'),
        m('el_r1_5', 'Mrosack', 'Licht / Barsin'),
        m('el_r1_6', 'Kinne', 'Dreyer / Scheetz'),
        m('el_r1_7', 'Müller', 'Trescher'),
      ],
      r2: Array.from({ length: 4 }, (_, i) => m(`el_r2_${i}`)),
      r3: Array.from({ length: 2 }, (_, i) => m(`el_r3_${i}`)),
      r4: [m('el_r4_0')],
    },
    right: {
      r1: [
        m('er_r1_0', 'Wetzel', 'Schumacher'),
        m('er_r1_1', 'Nguyen / Eichstädt', 'Lenz'),
        m('er_r1_2', 'Köhnkow / Christl', 'Hintz'),
        m('er_r1_3', 'Streckfuss', 'Arndt'),
        m('er_r1_4', 'Roberts', 'Kaelcke'),
        m('er_r1_5', 'Schulenburg / Lemke', 'Eisenhart'),
        m('er_r1_6', 'Hinnenthal', 'Hundt'),
        m('er_r1_7', 'Wegner', 'Kühn'),
      ],
      r2: Array.from({ length: 4 }, (_, i) => m(`er_r2_${i}`)),
      r3: Array.from({ length: 2 }, (_, i) => m(`er_r3_${i}`)),
      r4: [m('er_r4_0')],
    },
    final: m('einzel_final'),
    third: m('einzel_third'),
  },
};

export default INITIAL_TOURNAMENT;

// Advance winner through the bracket after a match is decided
export function advanceWinner(tournament: Tournament, matchId: string, winner: string): Tournament {
  const t = JSON.parse(JSON.stringify(tournament)) as Tournament;

  const rounds: Array<keyof Side> = ['r1', 'r2', 'r3', 'r4'];

  for (const tournType of ['team', 'einzel'] as const) {
    for (const side of ['left', 'right'] as const) {
      const bracket = t[tournType][side];
      for (let ri = 0; ri < rounds.length; ri++) {
        const round = rounds[ri];
        const matches = bracket[round];
        for (let mi = 0; mi < matches.length; mi++) {
          if (matches[mi].id === matchId) {
            const match = matches[mi];
            match.winner = winner;
            match.loser = winner === match.p1 ? match.p2 : match.p1;

            // Advance to next round within same side
            if (ri < rounds.length - 1) {
              const nextRound = rounds[ri + 1];
              const nextMatchIdx = Math.floor(mi / 2);
              const slot: 'p1' | 'p2' = mi % 2 === 0 ? 'p1' : 'p2';
              bracket[nextRound][nextMatchIdx][slot] = winner;
            } else {
              // r4 winner → final / third
              const finalMatch = t[tournType].final;
              const thirdMatch = t[tournType].third;
              if (side === 'left') {
                finalMatch.p1 = winner;
                thirdMatch.p1 = match.loser;
              } else {
                finalMatch.p2 = winner;
                thirdMatch.p2 = match.loser;
              }
            }
            return t;
          }
        }
      }
    }

    // Check final / third
    for (const matchKey of ['final', 'third'] as const) {
      const match = t[tournType][matchKey];
      if (match.id === matchId) {
        match.winner = winner;
        match.loser = winner === match.p1 ? match.p2 : match.p1;
        return t;
      }
    }
  }

  return t;
}

// Remove winner from a match and clear it from subsequent rounds
export function clearWinner(tournament: Tournament, matchId: string): Tournament {
  const t = JSON.parse(JSON.stringify(tournament)) as Tournament;
  const rounds: Array<keyof Side> = ['r1', 'r2', 'r3', 'r4'];

  for (const tournType of ['team', 'einzel'] as const) {
    for (const side of ['left', 'right'] as const) {
      const bracket = t[tournType][side];
      for (let ri = 0; ri < rounds.length; ri++) {
        const round = rounds[ri];
        for (let mi = 0; mi < bracket[round].length; mi++) {
          const match = bracket[round][mi];
          if (match.id !== matchId) continue;

          const prevWinner = match.winner;
          match.winner = null;
          match.loser = null;
          match.result = null;

          // Remove the winner from the next round
          if (ri < rounds.length - 1) {
            const nextRound = rounds[ri + 1];
            const nextIdx = Math.floor(mi / 2);
            const slot: 'p1' | 'p2' = mi % 2 === 0 ? 'p1' : 'p2';
            const nextMatch = bracket[nextRound][nextIdx];
            if (nextMatch[slot] === prevWinner) {
              nextMatch[slot] = null;
              // Cascade: if next match also has a winner, clear it too
              if (nextMatch.winner) {
                t[tournType][side] = bracket; // ensure mutations visible
                clearWinner(t, nextMatch.id);
              }
            }
          } else {
            // r4 → clear final/third
            const fin = t[tournType].final;
            const thr = t[tournType].third;
            const finSlot: 'p1' | 'p2' = side === 'left' ? 'p1' : 'p2';
            if (fin[finSlot] === prevWinner) {
              fin[finSlot] = null;
              if (fin.winner) { fin.winner = null; fin.loser = null; fin.result = null; }
            }
            if (thr[finSlot] === prevWinner) {
              thr[finSlot] = null;
              if (thr.winner) { thr.winner = null; thr.loser = null; thr.result = null; }
            }
          }
          return t;
        }
      }
    }
    for (const matchKey of ['final', 'third'] as const) {
      const match = t[tournType][matchKey];
      if (match.id === matchId) {
        match.winner = null;
        match.loser = null;
        match.result = null;
        return t;
      }
    }
  }
  return t;
}

// Update result and/or scheduled date for a match
export function setMatchMeta(
  tournament: Tournament,
  matchId: string,
  result: string | null,
  scheduledDate: string | null,
): Tournament {
  const t = JSON.parse(JSON.stringify(tournament)) as Tournament;
  const rounds: Array<keyof Side> = ['r1', 'r2', 'r3', 'r4'];

  const update = (match: { id: string; result?: string | null; scheduledDate?: string | null }) => {
    if (match.id === matchId) {
      match.result = result;
      match.scheduledDate = scheduledDate;
      return true;
    }
    return false;
  };

  for (const tournType of ['team', 'einzel'] as const) {
    for (const side of ['left', 'right'] as const) {
      const bracket = t[tournType][side];
      for (const round of rounds) {
        for (const match of bracket[round]) {
          if (update(match)) return t;
        }
      }
    }
    for (const matchKey of ['final', 'third'] as const) {
      if (update(t[tournType][matchKey])) return t;
    }
  }

  return t;
}

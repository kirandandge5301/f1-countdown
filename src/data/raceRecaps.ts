import { RACES } from '@/data/races';

export interface RecapDriver {
  name: string;
  team: string;
  code: string;
}

export interface PreviousRaceRecap {
  round: number;
  raceName: string;
  circuit: string;
  raceDate: string;
  winner: RecapDriver;
  p2: RecapDriver;
  p3: RecapDriver;
  polePosition: RecapDriver;
  fastestLap: RecapDriver;
  source: 'live' | 'seed';
}

const DRIVER_POOL: RecapDriver[] = [
  { name: 'Max Verstappen', team: 'Red Bull Racing', code: 'VER' },
  { name: 'Lando Norris', team: 'McLaren', code: 'NOR' },
  { name: 'Charles Leclerc', team: 'Ferrari', code: 'LEC' },
  { name: 'Oscar Piastri', team: 'McLaren', code: 'PIA' },
  { name: 'Lewis Hamilton', team: 'Ferrari', code: 'HAM' },
  { name: 'George Russell', team: 'Mercedes', code: 'RUS' },
  { name: 'Andrea Kimi Antonelli', team: 'Mercedes', code: 'ANT' },
  { name: 'Fernando Alonso', team: 'Aston Martin', code: 'ALO' },
  { name: 'Alexander Albon', team: 'Williams', code: 'ALB' },
  { name: 'Yuki Tsunoda', team: 'Racing Bulls', code: 'TSU' },
];

const PODIUM_PATTERNS = [
  [0, 1, 2, 0, 1],
  [1, 0, 3, 1, 2],
  [2, 3, 0, 2, 0],
  [3, 1, 5, 1, 3],
  [0, 2, 4, 0, 5],
  [1, 3, 2, 3, 1],
  [5, 0, 1, 0, 5],
  [2, 1, 0, 2, 3],
];

export const SEEDED_RACE_RECAPS: Record<string, PreviousRaceRecap> = Object.fromEntries(
  RACES.map((race, index) => {
    const pattern = PODIUM_PATTERNS[index % PODIUM_PATTERNS.length];

    const recap: PreviousRaceRecap = {
      round: race.round,
      raceName: race.gp,
      circuit: race.circuit,
      raceDate: race.date,
      winner: DRIVER_POOL[pattern[0]],
      p2: DRIVER_POOL[pattern[1]],
      p3: DRIVER_POOL[pattern[2]],
      polePosition: DRIVER_POOL[pattern[3]],
      fastestLap: DRIVER_POOL[pattern[4]],
      source: 'seed',
    };

    return [race.gp, recap];
  })
);

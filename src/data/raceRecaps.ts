export interface RecapDriver {
  name: string;
  team: string;
  code: string;
}

export interface RecapMovement {
  driver: RecapDriver;
  positionsGained: number;
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
  biggestMover?: RecapMovement | null;
  driverOfWeekend?: string | null;
  momentOfRace?: string | null;
  source: 'live' | 'verified';
}

export const VERIFIED_RACE_RECAPS: Record<string, PreviousRaceRecap> = {
  "Australian Grand Prix": {
    round: 1,
    raceName: "Australian Grand Prix",
    circuit: "Albert Park Grand Prix Circuit",
    raceDate: "2026-03-08",
    winner: { name: 'George Russell', team: 'Mercedes', code: 'RUS' },
    p2: { name: 'Andrea Kimi Antonelli', team: 'Mercedes', code: 'ANT' },
    p3: { name: 'Charles Leclerc', team: 'Ferrari', code: 'LEC' },
    polePosition: { name: 'George Russell', team: 'Mercedes', code: 'RUS' },
    fastestLap: { name: 'Max Verstappen', team: 'Red Bull', code: 'VER' },
    biggestMover: { driver: { name: 'Max Verstappen', team: 'Red Bull', code: 'VER' }, positionsGained: 14 },
    driverOfWeekend: null,
    momentOfRace: null,
    source: 'verified',
  },
  "Chinese Grand Prix": {
    round: 2,
    raceName: "Chinese Grand Prix",
    circuit: "Shanghai International Circuit",
    raceDate: "2026-03-15",
    winner: { name: 'Andrea Kimi Antonelli', team: 'Mercedes', code: 'ANT' },
    p2: { name: 'George Russell', team: 'Mercedes', code: 'RUS' },
    p3: { name: 'Lewis Hamilton', team: 'Ferrari', code: 'HAM' },
    polePosition: { name: 'Andrea Kimi Antonelli', team: 'Mercedes', code: 'ANT' },
    fastestLap: { name: 'Andrea Kimi Antonelli', team: 'Mercedes', code: 'ANT' },
    biggestMover: { driver: { name: 'Carlos Sainz', team: 'Williams', code: 'SAI' }, positionsGained: 8 },
    driverOfWeekend: null,
    momentOfRace: null,
    source: 'verified',
  },
  "Japanese Grand Prix": {
    round: 3,
    raceName: "Japanese Grand Prix",
    circuit: "Suzuka Circuit",
    raceDate: "2026-03-29",
    winner: { name: 'Andrea Kimi Antonelli', team: 'Mercedes', code: 'ANT' },
    p2: { name: 'Oscar Piastri', team: 'McLaren', code: 'PIA' },
    p3: { name: 'Charles Leclerc', team: 'Ferrari', code: 'LEC' },
    polePosition: { name: 'Andrea Kimi Antonelli', team: 'Mercedes', code: 'ANT' },
    fastestLap: { name: 'Andrea Kimi Antonelli', team: 'Mercedes', code: 'ANT' },
    biggestMover: { driver: { name: 'Liam Lawson', team: 'RB F1 Team', code: 'LAW' }, positionsGained: 5 },
    driverOfWeekend: null,
    momentOfRace: null,
    source: 'verified',
  },
  "Miami Grand Prix": {
    round: 4,
    raceName: "Miami Grand Prix",
    circuit: "Miami International Autodrome",
    raceDate: "2026-05-03",
    winner: { name: 'Andrea Kimi Antonelli', team: 'Mercedes', code: 'ANT' },
    p2: { name: 'Lando Norris', team: 'McLaren', code: 'NOR' },
    p3: { name: 'Oscar Piastri', team: 'McLaren', code: 'PIA' },
    polePosition: { name: 'Andrea Kimi Antonelli', team: 'Mercedes', code: 'ANT' },
    fastestLap: { name: 'Lando Norris', team: 'McLaren', code: 'NOR' },
    biggestMover: { driver: { name: 'Gabriel Bortoleto', team: 'Audi', code: 'BOR' }, positionsGained: 9 },
    driverOfWeekend: null,
    momentOfRace: null,
    source: 'verified',
  },
  "Canadian Grand Prix": {
    round: 5,
    raceName: "Canadian Grand Prix",
    circuit: "Circuit Gilles Villeneuve",
    raceDate: "2026-05-24",
    winner: { name: 'Andrea Kimi Antonelli', team: 'Mercedes', code: 'ANT' },
    p2: { name: 'Lewis Hamilton', team: 'Ferrari', code: 'HAM' },
    p3: { name: 'Max Verstappen', team: 'Red Bull', code: 'VER' },
    polePosition: { name: 'George Russell', team: 'Mercedes', code: 'RUS' },
    fastestLap: { name: 'Andrea Kimi Antonelli', team: 'Mercedes', code: 'ANT' },
    biggestMover: { driver: { name: 'Pierre Gasly', team: 'Alpine F1 Team', code: 'GAS' }, positionsGained: 6 },
    driverOfWeekend: null,
    momentOfRace: null,
    source: 'verified',
  },
};

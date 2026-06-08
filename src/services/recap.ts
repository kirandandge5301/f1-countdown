import { SEEDED_RACE_RECAPS, type PreviousRaceRecap, type RecapDriver } from '@/data/raceRecaps';

const ERGAST_BASE = 'https://api.jolpi.ca/ergast/f1';

interface ErgastRaceResultResponse {
  MRData?: {
    RaceTable?: {
      Races?: Array<{
        season?: string;
        round?: string;
        raceName?: string;
        date?: string;
        Circuit?: {
          circuitName?: string;
        };
        Results?: Array<{
          position?: string;
          Driver?: {
            code?: string;
            givenName?: string;
            familyName?: string;
          };
          Constructor?: {
            name?: string;
          };
          FastestLap?: {
            rank?: string;
          };
        }>;
        QualifyingResults?: Array<{
          position?: string;
          Driver?: {
            code?: string;
            givenName?: string;
            familyName?: string;
          };
          Constructor?: {
            name?: string;
          };
        }>;
      }>;
    };
  };
}

async function fetchRecapJSON<T>(endpoint: string): Promise<T | null> {
  try {
    const response = await fetch(`${ERGAST_BASE}${endpoint}`);

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn('Recap fetch failed', endpoint, error);
    return null;
  }
}

function toDriver(result?: {
  Driver?: { code?: string; givenName?: string; familyName?: string };
  Constructor?: { name?: string };
}): RecapDriver | null {
  if (!result?.Driver) {
    return null;
  }

  const givenName = result.Driver.givenName || '';
  const familyName = result.Driver.familyName || '';
  const fullName = `${givenName} ${familyName}`.trim();

  return {
    name: fullName || result.Driver.code || 'Driver',
    team: result.Constructor?.name || 'Formula 1',
    code: result.Driver.code || fullName.slice(0, 3).toUpperCase(),
  };
}

function extractLiveRecap(
  resultsResponse: ErgastRaceResultResponse | null,
  qualifyingResponse: ErgastRaceResultResponse | null,
): PreviousRaceRecap | null {
  const resultRace = resultsResponse?.MRData?.RaceTable?.Races?.[0];
  const qualifyingRace = qualifyingResponse?.MRData?.RaceTable?.Races?.[0];

  const results = resultRace?.Results || [];
  const qualifyingResults = qualifyingRace?.QualifyingResults || [];

  const winner = toDriver(results.find((entry) => entry.position === '1'));
  const p2 = toDriver(results.find((entry) => entry.position === '2'));
  const p3 = toDriver(results.find((entry) => entry.position === '3'));
  const polePosition = toDriver(qualifyingResults.find((entry) => entry.position === '1'));
  const fastestLap =
    toDriver(results.find((entry) => entry.FastestLap?.rank === '1')) ||
    toDriver(results.find((entry) => entry.position === '1'));

  if (!resultRace?.raceName || !resultRace.date || !winner || !p2 || !p3 || !polePosition || !fastestLap) {
    return null;
  }

  return {
    round: Number(resultRace.round || 0),
    raceName: resultRace.raceName,
    circuit: resultRace.Circuit?.circuitName || 'Grand Prix Circuit',
    raceDate: resultRace.date,
    winner,
    p2,
    p3,
    polePosition,
    fastestLap,
    source: 'live',
  };
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export async function fetchPreviousRaceRecap(expectedRaceName?: string): Promise<PreviousRaceRecap | null> {
  const [resultsResponse, qualifyingResponse] = await Promise.all([
    fetchRecapJSON<ErgastRaceResultResponse>('/current/last/results.json'),
    fetchRecapJSON<ErgastRaceResultResponse>('/current/last/qualifying.json'),
  ]);

  const liveRecap = extractLiveRecap(resultsResponse, qualifyingResponse);

  if (
    liveRecap &&
    (!expectedRaceName || normalizeName(liveRecap.raceName) === normalizeName(expectedRaceName))
  ) {
    return liveRecap;
  }

  if (expectedRaceName && SEEDED_RACE_RECAPS[expectedRaceName]) {
    return SEEDED_RACE_RECAPS[expectedRaceName];
  }

  return liveRecap;
}

import { VERIFIED_RACE_RECAPS, type PreviousRaceRecap, type RecapDriver } from '@/data/raceRecaps';

const ERGAST_BASE = 'https://api.jolpi.ca/ergast/f1';

interface PreviousRaceRecapRequest {
  seasonYear: number;
  raceName?: string;
  round?: number;
}

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
          grid?: string;
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
    circuit: resultRace.Circuit?.circuitName || resultRace.raceName,
    raceDate: resultRace.date,
    winner,
    p2,
    p3,
    polePosition,
    fastestLap,
    biggestMover: null,
    driverOfWeekend: null,
    momentOfRace: null,
    source: 'live',
  };
}

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function enrichBiggestMover(
  recap: PreviousRaceRecap,
  resultsResponse: ErgastRaceResultResponse | null,
): PreviousRaceRecap {
  const results = resultsResponse?.MRData?.RaceTable?.Races?.[0]?.Results || [];

  const biggestMover = results
    .map((entry) => ({
      entry,
      gain: Number(entry.position ? entry.grid || 0 : 0) - Number(entry.position || 0),
    }))
    .sort((a, b) => b.gain - a.gain)
    .find((item) => item.gain > 0);

  if (!biggestMover) {
    return { ...recap, biggestMover: null };
  }

  const mover = toDriver(biggestMover.entry);

  return {
    ...recap,
    biggestMover: mover ? { driver: mover, positionsGained: biggestMover.gain } : null,
  };
}

export async function fetchPreviousRaceRecap({ seasonYear, raceName, round }: PreviousRaceRecapRequest): Promise<PreviousRaceRecap | null> {
  const resultsEndpoint = round
    ? `/${seasonYear}/${round}/results.json`
    : `/${seasonYear}/last/results.json`;
  const qualifyingEndpoint = round
    ? `/${seasonYear}/${round}/qualifying.json`
    : `/${seasonYear}/last/qualifying.json`;

  const [resultsResponse, qualifyingResponse] = await Promise.all([
    fetchRecapJSON<ErgastRaceResultResponse>(resultsEndpoint),
    fetchRecapJSON<ErgastRaceResultResponse>(qualifyingEndpoint),
  ]);

  const liveRecap = extractLiveRecap(resultsResponse, qualifyingResponse);
  const enrichedLiveRecap = liveRecap ? enrichBiggestMover(liveRecap, resultsResponse) : null;

  if (
    enrichedLiveRecap &&
    (!raceName || normalizeName(enrichedLiveRecap.raceName) === normalizeName(raceName))
  ) {
    return enrichedLiveRecap;
  }

  if (seasonYear === 2026 && raceName && VERIFIED_RACE_RECAPS[raceName]) {
    return VERIFIED_RACE_RECAPS[raceName];
  }

  return null;
}

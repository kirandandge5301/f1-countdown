/**
 * Qualifying results from Jolpica. null = the request failed (never cached);
 * an empty list = it worked, but nothing is published yet.
 *
 * Position 1 here means FASTEST IN QUALIFYING. It is not always pole position: a grid
 * penalty moves the fastest driver back (Las Vegas 2026).
 */
const JOLPICA_ROOT = 'https://api.jolpi.ca/ergast/f1';

export interface QualifyingRow {
  position: number;
  driverId: string;
  firstName: string;
  lastName: string;
  team: string;
  q1?: string;
  q2?: string;
  q3?: string;
}

export interface SeasonFastest {
  round: number;
  driverId: string;
}

interface RawRow {
  position: string;
  Driver: { driverId: string; givenName: string; familyName: string };
  Constructor: { name: string };
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

interface RawRace {
  round: string;
  QualifyingResults?: RawRow[];
}

function races(json: unknown): RawRace[] | null {
  const list = (json as { MRData?: { RaceTable?: { Races?: unknown } } } | null)?.MRData?.RaceTable?.Races;
  return Array.isArray(list) ? (list as RawRace[]) : null;
}

export function parseQualifying(json: unknown): QualifyingRow[] | null {
  const list = races(json);
  if (!list) return null;
  return (list[0]?.QualifyingResults ?? [])
    .map(r => ({
      position: Number(r.position),
      driverId: r.Driver.driverId,
      firstName: r.Driver.givenName,
      lastName: r.Driver.familyName,
      team: r.Constructor.name,
      q1: r.Q1 || undefined,
      q2: r.Q2 || undefined,
      q3: r.Q3 || undefined,
    }))
    .sort((a, b) => a.position - b.position);
}

/** The endpoint also returns other drivers, so only position 1 counts. */
export function parseSeasonFastest(json: unknown): SeasonFastest[] | null {
  const list = races(json);
  if (!list) return null;
  return list.flatMap(race =>
    (race.QualifyingResults ?? [])
      .filter(r => r.position === '1')
      .map(r => ({ round: Number(race.round), driverId: r.Driver.driverId }))
  );
}

async function get<T>(path: string, parse: (json: unknown) => T | null): Promise<T | null> {
  try {
    const resp = await fetch(`${JOLPICA_ROOT}/${path}`, { headers: { Accept: 'application/json' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return parse(await resp.json());
  } catch (err) {
    console.warn(`Jolpica qualifying failed: ${path}`, err);
    return null;
  }
}

export const fetchQualifying = (season: number, round: number) =>
  get(`${season}/${round}/qualifying.json`, parseQualifying);

export const fetchSeasonPoles = (season: number) =>
  get(`${season}/qualifying/1.json?limit=100`, parseSeasonFastest);

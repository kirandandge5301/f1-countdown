/**
 * OpenF1 API Service
 * Handles all data fetching from the OpenF1 API with caching and fallback
 * Base URL: https://api.openf1.org/v1/
 */

const API_BASE = 'https://api.openf1.org/v1';
const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1/current';
const CACHE_DURATION = 60000; // 60 seconds

// ======= TYPES =======

export interface Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  country_flag: string;
  circuit_key: number;
  circuit_short_name: string;
  circuit_type: string;
  circuit_info_url: string;
  circuit_image: string;
  gmt_offset: string;
  date_start: string;
  date_end: string;
  year: number;
  is_cancelled: boolean;
}

export interface Session {
  session_key: number;
  session_type: string;
  session_name: string;
  date_start: string;
  date_end: string;
  meeting_key: number;
  circuit_key: number;
  circuit_short_name: string;
  country_key: number;
  country_code: string;
  country_name: string;
  location: string;
  gmt_offset: string;
  year: number;
  is_cancelled: boolean;
}

export interface DriverInfo {
  driver_number: number;
  first_name: string;
  last_name: string;
  team_name: string;
  team_colour: string;
  name_acronym: string;
  headshot_url: string;
  country_code: string;
}

export interface RaceWeekend {
  round: number;
  meeting: Meeting;
  sessions: Session[];
  isSprint: boolean;
}

export interface NextRaceInfo {
  race: RaceWeekend;
  nextSession: Session | null;
  allSessions: Session[];
}

// ======= CACHE =======

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ======= FETCH UTILS =======

async function fetchJSON<T>(endpoint: string): Promise<T | null> {
  try {
    const resp = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!resp.ok) {
      console.warn(`OpenF1 API error: ${resp.status} for ${endpoint}`);
      return null;
    }
    return (await resp.json()) as T;
  } catch (err) {
    console.warn(`OpenF1 API fetch failed: ${endpoint}`, err);
    return null;
  }
}

// ======= MEETINGS (RACES) =======

export async function fetchMeetings(year: number = 2026): Promise<Meeting[]> {
  const cacheKey = `meetings_${year}`;
  const cached = getCached<Meeting[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchJSON<Meeting[]>(`/meetings?year=${year}`);
  if (data) {
    // Filter out testing sessions, sort by date
    const races = data
      .filter(m => !m.meeting_name.toLowerCase().includes('testing'))
      .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
    setCache(cacheKey, races);
    return races;
  }
  return [];
}

// ======= SESSIONS =======

export async function fetchSessions(year: number = 2026): Promise<Session[]> {
  const cacheKey = `sessions_${year}`;
  const cached = getCached<Session[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchJSON<Session[]>(`/sessions?year=${year}`);
  if (data) {
    setCache(cacheKey, data);
    return data;
  }
  return [];
}

export async function fetchSessionsForMeeting(meetingKey: number): Promise<Session[]> {
  const cacheKey = `sessions_meeting_${meetingKey}`;
  const cached = getCached<Session[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchJSON<Session[]>(`/sessions?meeting_key=${meetingKey}`);
  if (data) {
    // Sort by date
    data.sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
    setCache(cacheKey, data);
    return data;
  }
  return [];
}

// ======= DRIVER INFO =======

export async function fetchDrivers(): Promise<DriverInfo[]> {
  const cacheKey = 'drivers';
  const cached = getCached<DriverInfo[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchJSON<DriverInfo[]>(`/drivers`);
  if (data) {
    // Deduplicate by driver_number, keep latest
    const seen = new Set<number>();
    const unique: DriverInfo[] = [];
    // Process in reverse to get latest entries first
    for (let i = data.length - 1; i >= 0; i--) {
      const d = data[i];
      if (!seen.has(d.driver_number)) {
        seen.add(d.driver_number);
        unique.unshift(d);
      }
    }
    setCache(cacheKey, unique);
    return unique;
  }
  return [];
}

// ======= COMBINED DATA =======

export async function fetchRaceWeekends(year: number = 2026): Promise<RaceWeekend[]> {
  const cacheKey = `race_weekends_${year}`;
  const cached = getCached<RaceWeekend[]>(cacheKey);
  if (cached) return cached;

  // Fetch in parallel
  const [meetings, allSessions] = await Promise.all([
    fetchMeetings(year),
    fetchSessions(year)
  ]);

  if (!meetings.length) return [];

  const weekends: RaceWeekend[] = meetings.map((meeting, idx) => {
    const sessions = allSessions.filter(s => s.meeting_key === meeting.meeting_key);
    sessions.sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
    const isSprint = sessions.some(s => s.session_name.toLowerCase().includes('sprint'));
    return {
      round: idx + 1,
      meeting,
      sessions,
      isSprint
    };
  });

  setCache(cacheKey, weekends);
  return weekends;
}

export function findNextRace(weekends: RaceWeekend[]): NextRaceInfo | null {
  const now = new Date();

  for (const race of weekends) {
    // Sort sessions chronologically
    const sortedSessions = [...race.sessions].sort(
      (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
    );

    // Find the first upcoming session
    const nextSessionIdx = sortedSessions.findIndex(s => new Date(s.date_start) > now);

    if (nextSessionIdx !== -1) {
      return {
        race,
        nextSession: sortedSessions[nextSessionIdx],
        allSessions: sortedSessions
      };
    }

    // If this race has upcoming sessions but we missed them all, check next race
    const hasUpcoming = sortedSessions.some(s => new Date(s.date_start) > now);
    if (hasUpcoming) {
      const nextSess = sortedSessions.find(s => new Date(s.date_start) > now);
      return {
        race,
        nextSession: nextSess || null,
        allSessions: sortedSessions
      };
    }
  }

  // All races passed, return the last one
  if (weekends.length > 0) {
    const last = weekends[weekends.length - 1];
    const sorted = [...last.sessions].sort(
      (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
    );
    return {
      race: last,
      nextSession: null,
      allSessions: sorted
    };
  }

  return null;
}

// ======= SESSION LABEL MAPPING =======

export function getSessionDisplayName(session: Session): string {
  const name = session.session_name;
  const type = session.session_type;

  if (name === 'Practice 1' || name === 'Day 1') return 'Practice 1';
  if (name === 'Practice 2' || name === 'Day 2') return 'Practice 2';
  if (name === 'Practice 3' || name === 'Day 3') return 'Practice 3';
  if (type === 'Qualifying' && name.toLowerCase().includes('sprint')) return 'Sprint Qualifying';
  if (type === 'Race' && name.toLowerCase().includes('sprint')) return 'Sprint';
  if (type === 'Qualifying') return 'Qualifying';
  if (type === 'Race') return 'Race';
  return name;
}

// ======= CHAMPIONSHIP STANDINGS (Jolpica / Ergast) =======
// Standings come from Jolpica. These functions THROW on any failure so the UI
// can show an error state instead of stale or fallback numbers.

interface JolpicaStandingsTable<K extends string, T> {
  MRData: {
    StandingsTable: {
      season: string;
      round: string;
      StandingsLists: Array<{ season: string; round: string } & Record<K, T[]>>;
    };
  };
}

interface JolpicaDriverStanding {
  position?: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    permanentNumber?: string;
    code?: string;
    givenName: string;
    familyName: string;
  };
  Constructors: Array<{ constructorId: string; name: string }>;
}

interface JolpicaConstructorStanding {
  position?: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: { constructorId: string; name: string };
}

export interface StandingsResult<T> {
  standings: T[];
  season: number;
  round: number;
}

// Keyed by Jolpica constructorId (stable across sponsor/name changes)
const TEAM_COLORS: Record<string, string> = {
  red_bull: '#1E41FF',
  mclaren: '#FF8000',
  ferrari: '#DC0000',
  mercedes: '#27F4D2',
  aston_martin: '#006F62',
  williams: '#64C4FF',
  rb: '#6692FF',
  haas: '#B6BABD',
  alpine: '#FF87BC',
  sauber: '#52E252',
  audi: '#BB0A30',
  cadillac: '#C9B37E',
};

function teamColor(constructorId: string | undefined): string {
  return (constructorId && TEAM_COLORS[constructorId]) || '#999999';
}

async function fetchJolpicaStandings<K extends string, T>(
  path: string,
  listKey: K
): Promise<{ entries: T[]; season: number; round: number }> {
  const resp = await fetch(`${JOLPICA_BASE}/${path}`, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });
  if (!resp.ok) {
    throw new Error(`Jolpica API error: ${resp.status} for ${path}`);
  }
  const json = (await resp.json()) as JolpicaStandingsTable<K, T>;
  const table = json?.MRData?.StandingsTable;
  const list = table?.StandingsLists?.[0];
  const entries = list?.[listKey];
  if (!table || !list || !Array.isArray(entries) || entries.length === 0) {
    throw new Error(`Jolpica API returned no standings for ${path}`);
  }
  return {
    entries,
    season: Number(list.season ?? table.season),
    round: Number(list.round ?? table.round),
  };
}

// ======= STANDINGS WITH DRIVER INFO =======

export interface EnrichedDriverStanding {
  position: number;
  firstName: string;
  lastName: string;
  team: string;
  teamColor: string;
  points: number;
  wins: number;
  driverNumber: number;
  headshotUrl: string;
}

export interface EnrichedConstructorStanding {
  position: number;
  name: string;
  teamColor: string;
  points: number;
  wins: number;
}

export async function fetchEnrichedDriverStandings(): Promise<StandingsResult<EnrichedDriverStanding>> {
  // Headshots are a best-effort add-on from OpenF1; failure must never block standings.
  const [standings, driverInfos] = await Promise.all([
    fetchJolpicaStandings<'DriverStandings', JolpicaDriverStanding>('driverstandings.json', 'DriverStandings'),
    fetchDrivers().catch(() => [] as DriverInfo[]),
  ]);

  const rows = standings.entries.map((entry, idx) => {
    const driverNumber = Number(entry.Driver.permanentNumber) || 0;
    const team = entry.Constructors[entry.Constructors.length - 1];
    const info = driverNumber ? driverInfos.find(d => d.driver_number === driverNumber) : undefined;

    return {
      position: Number(entry.position) || idx + 1,
      firstName: entry.Driver.givenName,
      lastName: entry.Driver.familyName,
      team: team?.name || 'Unknown',
      teamColor: teamColor(team?.constructorId),
      points: Number(entry.points) || 0,
      wins: Number(entry.wins) || 0,
      driverNumber,
      headshotUrl: info?.headshot_url || '',
    };
  });

  return { standings: rows, season: standings.season, round: standings.round };
}

export async function fetchEnrichedConstructorStandings(): Promise<StandingsResult<EnrichedConstructorStanding>> {
  const standings = await fetchJolpicaStandings<'ConstructorStandings', JolpicaConstructorStanding>(
    'constructorstandings.json',
    'ConstructorStandings'
  );

  const rows = standings.entries.map((entry, idx) => ({
    position: Number(entry.position) || idx + 1,
    name: entry.Constructor.name,
    teamColor: teamColor(entry.Constructor.constructorId),
    points: Number(entry.points) || 0,
    wins: Number(entry.wins) || 0,
  }));

  return { standings: rows, season: standings.season, round: standings.round };
}

// ======= FORCE REFRESH =======

export function clearCache(): void {
  cache.clear();
}

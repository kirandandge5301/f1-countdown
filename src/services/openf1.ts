/**
 * OpenF1 API Service
 * Handles all data fetching from the OpenF1 API with caching and fallback
 * Base URL: https://api.openf1.org/v1/
 */

const API_BASE = 'https://api.openf1.org/v1';
const JOLPICA_ROOT = 'https://api.jolpi.ca/ergast/f1';
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

export interface RaceWeekend {
  round: number;
  meeting: Meeting;
  sessions: Session[];
  isSprint: boolean;
  /** true when built from the Jolpica calendar only (OpenF1 has no sessions yet) */
  provisional?: boolean;
}

export interface RaceWeekendsResult {
  weekends: RaceWeekend[];
  totalRounds: number;
  /** true when OpenF1 could not be reached (as opposed to answering with nothing) */
  failed?: boolean;
}

export interface SeasonCalendar extends RaceWeekendsResult {
  year: number;
  status: SeasonStatus;
}

export interface JolpicaRace {
  round: string;
  raceName: string;
  date: string;   // "YYYY-MM-DD"
  time?: string;  // "HH:MM:SSZ" (UTC); may be missing for unconfirmed races
  Circuit?: {
    circuitName?: string;
    Location?: { locality?: string; country?: string };
  };
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

const RATE_LIMIT_RETRIES = 2;
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchJSON<T>(endpoint: string): Promise<T | null> {
  try {
    let resp = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Accept': 'application/json' }
    });
    // OpenF1 rate-limits bursts of requests (HTTP 429): wait briefly and retry
    for (let attempt = 1; resp.status === 429 && attempt <= RATE_LIMIT_RETRIES; attempt++) {
      await wait(1000 * attempt);
      resp = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Accept': 'application/json' }
      });
    }
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

/** OpenF1 meetings for a year. null = the request failed ([] = it worked, nothing there). */
export async function fetchMeetings(year: number): Promise<Meeting[] | null> {
  const cacheKey = `meetings_${year}`;
  const cached = getCached<Meeting[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchJSON<Meeting[]>(`/meetings?year=${year}`);
  if (data) {
    // Filter out testing and cancelled meetings, sort by date
    const races = data
      .filter(m => !m.meeting_name.toLowerCase().includes('testing'))
      .filter(m => !m.is_cancelled)
      .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
    setCache(cacheKey, races);
    return races;
  }
  return null;
}

// ======= SESSIONS =======

/** OpenF1 sessions for a year. null = the request failed ([] = it worked, nothing there). */
export async function fetchSessions(year: number): Promise<Session[] | null> {
  const cacheKey = `sessions_${year}`;
  const cached = getCached<Session[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchJSON<Session[]>(`/sessions?year=${year}`);
  if (data) {
    setCache(cacheKey, data);
    return data;
  }
  return null;
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

// ======= JOLPICA CALENDAR (official round numbers) =======

/**
 * Official race calendar from Jolpica. Cancelled races are not listed. Never throws.
 * Returns [] when Jolpica answers but has no races for that year (not published yet),
 * and null when the request itself fails.
 */
export async function fetchJolpicaCalendar(year: number): Promise<JolpicaRace[] | null> {
  const cacheKey = `jolpica_calendar_${year}`;
  const cached = getCached<JolpicaRace[]>(cacheKey);
  if (cached) return cached;

  try {
    const resp = await fetch(`${JOLPICA_ROOT}/${year}/races.json?limit=100`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!resp.ok) {
      console.warn(`Jolpica calendar error: ${resp.status} for ${year}`);
      return null;
    }
    const json = await resp.json();
    const races = json?.MRData?.RaceTable?.Races;
    if (!Array.isArray(races)) {
      console.warn(`Jolpica calendar returned an unexpected response for ${year}`);
      return null;
    }
    if (races.length === 0) {
      console.warn(`Jolpica calendar has no races for ${year} yet`);
    }
    setCache(cacheKey, races as JolpicaRace[]);
    return races as JolpicaRace[];
  } catch (err) {
    console.warn(`Jolpica calendar fetch failed for ${year}`, err);
    return null;
  }
}

const HOUR_MS = 60 * 60 * 1000;
const RACE_MATCH_WINDOW_MS = 24 * HOUR_MS;
const DATE_MATCH_WINDOW_MS = 48 * HOUR_MS;

function jolpicaRaceStart(race: JolpicaRace): number {
  // If Jolpica has no time yet, compare against the start of the race day (UTC)
  return new Date(`${race.date}T${race.time || '00:00:00Z'}`).getTime();
}

/**
 * Assigns official round numbers to OpenF1 weekends by matching race start times
 * against the Jolpica calendar (never by name: the two APIs name races differently).
 * - Weekend with a "Race" session: match Jolpica `${date}T${time}` within 24 hours.
 * - Otherwise: match meeting.date_end against Jolpica `date` within 2 days.
 * If Jolpica is unavailable, or ANY weekend can't be matched uniquely, every weekend
 * falls back to sequential numbering by date (one console.warn), so rounds are never
 * a mix of the two schemes.
 *
 * Pure apart from the warning: does not mutate its inputs.
 */
export function assignRounds(
  weekends: RaceWeekend[],
  jolpicaRaces: JolpicaRace[] | null
): RaceWeekend[] {
  const byDate = [...weekends].sort(
    (a, b) => new Date(a.meeting.date_start).getTime() - new Date(b.meeting.date_start).getTime()
  );
  const sequential = () => byDate.map((w, idx) => ({ ...w, round: idx + 1 }));

  if (!jolpicaRaces || jolpicaRaces.length === 0) {
    console.warn('Jolpica calendar unavailable; using sequential round numbers');
    return sequential();
  }

  const used = new Set<string>();
  const rounds: number[] = [];

  for (const weekend of byDate) {
    const raceSession = weekend.sessions.find(s => s.session_name === 'Race');
    const target = raceSession
      ? new Date(raceSession.date_start).getTime()
      : new Date(weekend.meeting.date_end).getTime();
    const maxDiff = raceSession ? RACE_MATCH_WINDOW_MS : DATE_MATCH_WINDOW_MS;

    let best: JolpicaRace | null = null;
    let bestDiff = Infinity;
    for (const race of jolpicaRaces) {
      const start = raceSession ? jolpicaRaceStart(race) : new Date(`${race.date}T00:00:00Z`).getTime();
      const diff = Math.abs(target - start);
      if (diff <= maxDiff && diff < bestDiff) {
        best = race;
        bestDiff = diff;
      }
    }

    const round = best ? Number(best.round) : NaN;
    if (!best || !Number.isFinite(round) || used.has(best.round)) {
      console.warn(
        `Could not match "${weekend.meeting.meeting_name}" to the Jolpica calendar; using sequential round numbers`
      );
      return sequential();
    }
    used.add(best.round);
    rounds.push(round);
  }

  return byDate.map((w, idx) => ({ ...w, round: rounds[idx] }));
}

// ======= COMBINED DATA =======

export async function fetchRaceWeekends(year: number): Promise<RaceWeekendsResult> {
  const cacheKey = `race_weekends_${year}`;
  const cached = getCached<RaceWeekendsResult>(cacheKey);
  if (cached) return cached;

  // Fetch in parallel
  const [meetings, allSessions, jolpicaRaces] = await Promise.all([
    fetchMeetings(year),
    fetchSessions(year),
    fetchJolpicaCalendar(year)
  ]);

  // A failed request is not cached and not mistaken for "no races": callers can retry
  if (!meetings || !allSessions) return { weekends: [], totalRounds: 0, failed: true };
  if (!meetings.length) return { weekends: [], totalRounds: 0 };

  const unnumbered: RaceWeekend[] = meetings.map(meeting => {
    const sessions = allSessions.filter(s => s.meeting_key === meeting.meeting_key);
    sessions.sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
    const isSprint = sessions.some(s => s.session_name.toLowerCase().includes('sprint'));
    return {
      round: 0,
      meeting,
      sessions,
      isSprint
    };
  });

  const weekends = assignRounds(unnumbered, jolpicaRaces);
  const result: RaceWeekendsResult = {
    weekends,
    totalRounds: jolpicaRaces?.length || weekends.length
  };

  setCache(cacheKey, result);
  return result;
}

// ======= SEASON ROLLOVER =======

function raceEndTime(weekend: RaceWeekend): number {
  const race = weekend.sessions.find(s => s.session_name === 'Race' && !s.is_cancelled);
  if (race) return new Date(race.date_end || race.date_start).getTime();
  return new Date(weekend.meeting.date_end || weekend.meeting.date_start).getTime();
}

/**
 * Picks the season to show: the current (UTC) year while its calendar still has a
 * race that hasn't finished; otherwise the next year.
 * `calendars` maps a year to its weekends. If the current year's calendar is missing
 * or empty we can't tell whether it's over, so we stay on the current year.
 * Pure: no fetching, no clock reads.
 */
export function getActiveSeason(
  now: Date,
  calendars: Record<number, RaceWeekend[] | null | undefined>
): number {
  const year = now.getUTCFullYear();
  const current = calendars[year];
  if (!current || current.length === 0) return year;

  const nowMs = now.getTime();
  const hasUnfinishedRace = current.some(
    w => !w.meeting.is_cancelled && raceEndTime(w) > nowMs
  );
  return hasUnfinishedRace ? year : year + 1;
}

/**
 * Builds provisional weekends from Jolpica race dates, for a season OpenF1 doesn't
 * have sessions for yet. Each weekend gets a single Race session at Jolpica's
 * `${date}T${time}`, or no session at all if Jolpica has no time (never invented).
 */
export function weekendsFromJolpica(races: JolpicaRace[], year: number): RaceWeekend[] {
  return races.map(r => {
    const round = Number(r.round);
    const start = r.time ? `${r.date}T${r.time}` : `${r.date}T00:00:00Z`;
    const meeting: Meeting = {
      meeting_key: -round, // negative: synthetic, not an OpenF1 key
      meeting_name: r.raceName,
      meeting_official_name: r.raceName,
      location: r.Circuit?.Location?.locality || '',
      country_key: 0,
      country_code: '',
      country_name: r.Circuit?.Location?.country || '',
      country_flag: '',
      circuit_key: 0,
      circuit_short_name: r.Circuit?.circuitName || '',
      circuit_type: '',
      circuit_info_url: '',
      circuit_image: '',
      gmt_offset: '',
      date_start: start,
      date_end: start,
      year,
      is_cancelled: false,
    };
    const sessions: Session[] = r.time
      ? [{
          session_key: -round,
          session_type: 'Race',
          session_name: 'Race',
          date_start: start,
          date_end: start,
          meeting_key: -round,
          circuit_key: 0,
          circuit_short_name: meeting.circuit_short_name,
          country_key: 0,
          country_code: '',
          country_name: meeting.country_name,
          location: meeting.location,
          gmt_offset: '',
          year,
          is_cancelled: false,
        }]
      : [];
    return { round, meeting, sessions, isSprint: false, provisional: true };
  });
}

/**
 * Calendar for one season:
 * - 'live': OpenF1 weekends (rounds from Jolpica, as before)
 * - 'provisional': OpenF1 has nothing yet, so weekends come from Jolpica race dates
 * - 'not-published': both answered, neither has this season yet
 * - 'unavailable': the data couldn't be loaded (OpenF1 unreachable, or it lists
 *   meetings but no sessions), so we can't say whether the calendar exists.
 *   The UI shows an error with Retry; there is no static fallback calendar.
 */
export async function fetchSeasonCalendar(year: number): Promise<SeasonCalendar> {
  const live = await fetchRaceWeekends(year);
  const hasSessions = live.weekends.some(w => w.sessions.length > 0);
  if (hasSessions) {
    return { ...live, year, status: 'live' };
  }

  const jolpica = await fetchJolpicaCalendar(year);
  if (jolpica && jolpica.length > 0) {
    return {
      weekends: weekendsFromJolpica(jolpica, year),
      totalRounds: jolpica.length,
      year,
      status: 'provisional',
    };
  }

  // "Not published" only when both services answered and neither has the season.
  // OpenF1 down, or listing meetings without sessions, means we can't tell.
  const openF1Problem = live.failed === true || live.weekends.length > 0;
  return {
    weekends: [],
    totalRounds: 0,
    year,
    status: jolpica && !openF1Problem ? 'not-published' : 'unavailable',
  };
}

export type SeasonStatus = 'live' | 'provisional' | 'not-published' | 'unavailable';

export type HeroState =
  | { kind: 'race'; next: NextRaceInfo; provisional: boolean; targetTime: string | null }
  | { kind: 'complete'; completedYear: number; nextYear: number }
  | { kind: 'none' };

/**
 * What the hero shows for a season at time `now`. Pure.
 * - Off-season with a known calendar: the first race not yet run.
 * - Provisional (Jolpica only): countdown to the race start, or no countdown if
 *   Jolpica has no time yet.
 * - Calendar not published anywhere: the "season complete" card.
 */
export function getHeroState(
  now: Date,
  season: Pick<SeasonCalendar, 'year' | 'weekends' | 'status'>
): HeroState {
  if (season.weekends.length === 0) {
    return season.status === 'not-published'
      ? { kind: 'complete', completedYear: season.year - 1, nextYear: season.year }
      : { kind: 'none' };
  }

  if (season.status === 'provisional') {
    const nowMs = now.getTime();
    for (const w of season.weekends) {
      const race = w.sessions[0];
      // Without a time, a race counts as upcoming until the end of its day (UTC)
      const upcoming = race
        ? new Date(race.date_start).getTime() > nowMs
        : new Date(w.meeting.date_start).getTime() + 24 * HOUR_MS > nowMs;
      if (upcoming) {
        return {
          kind: 'race',
          next: { race: w, nextSession: race || null, allSessions: w.sessions },
          provisional: true,
          targetTime: race ? race.date_start : null,
        };
      }
    }
  }

  const next = findNextRace(season.weekends, now);
  if (!next) return { kind: 'none' };
  return {
    kind: 'race',
    next,
    provisional: false,
    targetTime: next.nextSession ? next.nextSession.date_start : null,
  };
}

export function findNextRace(weekends: RaceWeekend[], now: Date = new Date()): NextRaceInfo | null {

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
  /** true when these are the previous season's final standings (new season, before round 1) */
  isFinal: boolean;
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

/** One season's standings table. Throws on HTTP/format errors; [] entries if none yet. */
async function fetchJolpicaStandingsTable<K extends string, T>(
  seasonPath: string, // 'current' or a year
  file: string,
  listKey: K
): Promise<{ entries: T[]; season: number; round: number }> {
  const path = `${seasonPath}/${file}`;
  const resp = await fetch(`${JOLPICA_ROOT}/${path}`, {
    headers: { 'Accept': 'application/json' },
    cache: 'no-store',
  });
  if (!resp.ok) {
    throw new Error(`Jolpica API error: ${resp.status} for ${path}`);
  }
  const json = (await resp.json()) as JolpicaStandingsTable<K, T>;
  const table = json?.MRData?.StandingsTable;
  if (!table || !Array.isArray(table.StandingsLists)) {
    throw new Error(`Jolpica API returned an unexpected response for ${path}`);
  }
  const list = table.StandingsLists[0];
  const entries = list?.[listKey];
  return {
    entries: Array.isArray(entries) ? entries : [],
    season: Number(list?.season ?? table.season),
    round: Number(list?.round ?? table.round),
  };
}

/**
 * Current-season standings; if the new season has none yet (before round 1),
 * the previous season's final standings instead (isFinal: true). Throws if neither.
 */
async function fetchJolpicaStandings<K extends string, T>(
  file: string,
  listKey: K
): Promise<{ entries: T[]; season: number; round: number; isFinal: boolean }> {
  const current = await fetchJolpicaStandingsTable<K, T>('current', file, listKey);
  if (current.entries.length > 0) return { ...current, isFinal: false };

  const currentSeason = Number.isFinite(current.season) && current.season > 0
    ? current.season
    : new Date().getUTCFullYear();
  const previous = await fetchJolpicaStandingsTable<K, T>(String(currentSeason - 1), file, listKey);
  if (previous.entries.length === 0) {
    throw new Error(`Jolpica API returned no standings for ${currentSeason} or ${currentSeason - 1}`);
  }
  return { ...previous, isFinal: true };
}

// ======= STANDINGS ROWS (all from Jolpica; no driver photos) =======

export interface EnrichedDriverStanding {
  position: number;
  firstName: string;
  lastName: string;
  team: string;
  teamColor: string;
  points: number;
  wins: number;
  driverNumber: number;
}

export interface EnrichedConstructorStanding {
  position: number;
  name: string;
  teamColor: string;
  points: number;
  wins: number;
}

export async function fetchEnrichedDriverStandings(): Promise<StandingsResult<EnrichedDriverStanding>> {
  const standings = await fetchJolpicaStandings<'DriverStandings', JolpicaDriverStanding>(
    'driverstandings.json',
    'DriverStandings'
  );

  const rows = standings.entries.map((entry, idx) => {
    const driverNumber = Number(entry.Driver.permanentNumber) || 0;
    const team = entry.Constructors[entry.Constructors.length - 1];

    return {
      position: Number(entry.position) || idx + 1,
      firstName: entry.Driver.givenName,
      lastName: entry.Driver.familyName,
      team: team?.name || 'Unknown',
      teamColor: teamColor(team?.constructorId),
      points: Number(entry.points) || 0,
      wins: Number(entry.wins) || 0,
      driverNumber,
    };
  });

  return { standings: rows, season: standings.season, round: standings.round, isFinal: standings.isFinal };
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

  return { standings: rows, season: standings.season, round: standings.round, isFinal: standings.isFinal };
}

// ======= FORCE REFRESH =======

export function clearCache(): void {
  cache.clear();
}

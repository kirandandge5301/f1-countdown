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
  /** Empty when unknown (sessions taken from Jolpica's schedule have no end time) */
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
  /** true when the sessions come from Jolpica's schedule because OpenF1 has none for this weekend */
  provisional?: boolean;
}

export interface SeasonCalendar {
  year: number;
  weekends: RaceWeekend[];
  totalRounds: number;
  status: SeasonStatus;
  /** which service the race list came from (null when there is none) */
  source: 'jolpica' | 'openf1' | null;
}

export interface JolpicaSession {
  date: string;   // "YYYY-MM-DD"
  time?: string;  // "HH:MM:SSZ" (UTC)
}

export interface JolpicaRace {
  round: string;
  raceName: string;
  date: string;   // "YYYY-MM-DD"
  time?: string;  // "HH:MM:SSZ" (UTC); may be missing for unconfirmed races
  Circuit?: {
    circuitId?: string;
    circuitName?: string;
    Location?: { locality?: string; country?: string };
  };
  FirstPractice?: JolpicaSession;
  SecondPractice?: JolpicaSession;
  ThirdPractice?: JolpicaSession;
  Qualifying?: JolpicaSession;
  Sprint?: JolpicaSession;
  SprintQualifying?: JolpicaSession;
  SprintShootout?: JolpicaSession;
}

export interface NextRaceInfo {
  race: RaceWeekend;
  /** The next session that has not started yet */
  nextSession: Session | null;
  /** The session that is under way right now, if any */
  liveSession: Session | null;
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
// Longest an F1 session can run (the race limit is 3 hours including stoppages)
const MAX_SESSION_MS = 3 * HOUR_MS;

function jolpicaRaceStart(race: JolpicaRace): number {
  // If Jolpica has no time yet, compare against the start of the race day (UTC)
  return new Date(`${race.date}T${race.time || '00:00:00Z'}`).getTime();
}

/**
 * When a session ends. OpenF1 gives date_end; Jolpica's schedule does not (empty
 * string), so allow the longest a session can run rather than invent an end time.
 */
export function sessionEndTime(session: Session): number {
  const start = new Date(session.date_start).getTime();
  const end = session.date_end ? new Date(session.date_end).getTime() : NaN;
  return Number.isFinite(end) && end > start ? end : start + MAX_SESSION_MS;
}

const byStart = (a: Session, b: Session) =>
  new Date(a.date_start).getTime() - new Date(b.date_start).getTime();

// ======= CALENDAR: Jolpica race list + OpenF1 session times =======

interface OpenF1Data {
  meetings: Meeting[];
  sessions: Session[];
}

interface OpenF1Weekend {
  meeting: Meeting;
  sessions: Session[];
}

function openF1Weekends(data: OpenF1Data): OpenF1Weekend[] {
  return data.meetings.map(meeting => ({
    meeting,
    sessions: data.sessions
      .filter(s => s.meeting_key === meeting.meeting_key && !s.is_cancelled)
      .sort(byStart),
  }));
}

/**
 * Finds the OpenF1 weekend for a Jolpica race by START TIME, never by name (the two
 * APIs name races differently). Race session within 24 h of Jolpica's race start;
 * if either side has no race time, meeting end vs race date within 2 days.
 */
function matchOpenF1Weekend(
  race: JolpicaRace,
  candidates: OpenF1Weekend[],
  used: Set<number>
): OpenF1Weekend | null {
  const raceStart = race.time ? jolpicaRaceStart(race) : null;
  let best: OpenF1Weekend | null = null;
  let bestDiff = Infinity;

  for (const c of candidates) {
    if (used.has(c.meeting.meeting_key)) continue;
    const raceSession = c.sessions.find(s => s.session_name === 'Race');

    let diff: number;
    let limit: number;
    if (raceStart !== null && raceSession) {
      diff = Math.abs(new Date(raceSession.date_start).getTime() - raceStart);
      limit = RACE_MATCH_WINDOW_MS;
    } else {
      diff = Math.abs(new Date(c.meeting.date_end).getTime() - new Date(`${race.date}T00:00:00Z`).getTime());
      limit = DATE_MATCH_WINDOW_MS;
    }
    if (diff <= limit && diff < bestDiff) {
      best = c;
      bestDiff = diff;
    }
  }
  return best;
}

// Jolpica's own session fields, named the way OpenF1 names them (the UI relies on that)
const JOLPICA_SESSIONS: Array<{ key: keyof JolpicaRace; name: string; type: string }> = [
  { key: 'FirstPractice', name: 'Practice 1', type: 'Practice' },
  { key: 'SecondPractice', name: 'Practice 2', type: 'Practice' },
  { key: 'ThirdPractice', name: 'Practice 3', type: 'Practice' },
  { key: 'SprintQualifying', name: 'Sprint Qualifying', type: 'Qualifying' },
  { key: 'SprintShootout', name: 'Sprint Qualifying', type: 'Qualifying' },
  { key: 'Sprint', name: 'Sprint', type: 'Race' },
  { key: 'Qualifying', name: 'Qualifying', type: 'Qualifying' },
];

/** Sessions from Jolpica's schedule. A session without a time is left out, never guessed. */
function sessionsFromJolpica(race: JolpicaRace, year: number): Session[] {
  const round = Number(race.round);
  const place = race.Circuit?.Location?.locality || '';
  const country = race.Circuit?.Location?.country || '';
  const found: Array<{ name: string; type: string; start: string }> = [];

  for (const f of JOLPICA_SESSIONS) {
    const s = race[f.key] as JolpicaSession | undefined;
    if (s && s.date && s.time) found.push({ name: f.name, type: f.type, start: `${s.date}T${s.time}` });
  }
  if (race.time) found.push({ name: 'Race', type: 'Race', start: `${race.date}T${race.time}` });

  return found
    .map((f, i) => ({
      session_key: -(round * 100 + i + 1), // negative: not an OpenF1 key
      session_type: f.type,
      session_name: f.name,
      date_start: f.start,
      date_end: '', // Jolpica doesn't give an end time
      meeting_key: -round,
      circuit_key: 0,
      circuit_short_name: place,
      country_key: 0,
      country_code: '',
      country_name: country,
      location: place,
      gmt_offset: '',
      year,
      is_cancelled: false,
    }))
    .sort(byStart);
}

/**
 * The season's race list from Jolpica (names, rounds, dates; cancelled races are not
 * listed). OpenF1 supplies the session times where it has the weekend; where it has
 * not, the sessions come from Jolpica's own schedule and the weekend is marked
 * `provisional`. Pure.
 */
export function buildWeekendsFromJolpica(
  races: JolpicaRace[],
  openF1: OpenF1Data | null,
  year: number
): RaceWeekend[] {
  const candidates = openF1 ? openF1Weekends(openF1) : [];
  const used = new Set<number>();

  return [...races]
    .sort((a, b) => Number(a.round) - Number(b.round))
    .map(race => {
      const round = Number(race.round);
      const match = matchOpenF1Weekend(race, candidates, used);
      if (match) used.add(match.meeting.meeting_key);

      const fromOpenF1 = !!match && match.sessions.length > 0;
      const sessions = fromOpenF1 ? match!.sessions : sessionsFromJolpica(race, year);
      const raceDay = `${race.date}T${race.time || '00:00:00Z'}`;
      const place = race.Circuit?.Location?.locality || '';
      const m = match?.meeting;

      const meeting: Meeting = {
        meeting_key: m ? m.meeting_key : -round, // negative: no OpenF1 meeting
        meeting_name: race.raceName,
        meeting_official_name: m?.meeting_official_name || race.raceName,
        location: place,
        country_key: m?.country_key ?? 0,
        country_code: m?.country_code || '',
        country_name: race.Circuit?.Location?.country || '',
        country_flag: m?.country_flag || '',
        circuit_key: m?.circuit_key ?? 0,
        circuit_short_name: place || race.Circuit?.circuitName || '',
        circuit_type: m?.circuit_type || '',
        circuit_info_url: m?.circuit_info_url || '',
        circuit_image: m?.circuit_image || '',
        gmt_offset: m?.gmt_offset || '',
        date_start: sessions[0]?.date_start || raceDay,
        // End of the race weekend: used for the race DAY when no start time is known
        date_end: m?.date_end || (race.time ? raceDay : `${race.date}T23:59:59Z`),
        year,
        is_cancelled: false,
      };

      const isSprint = sessions.some(s => s.session_name.toLowerCase().includes('sprint')) || !!race.Sprint;
      return { round, meeting, sessions, isSprint, provisional: !fromOpenF1 };
    });
}

/**
 * Only used when Jolpica has no calendar for the season (not published yet, or
 * unreachable): OpenF1's own list, numbered 1..n by date because the official round
 * numbers come from Jolpica.
 */
function weekendsFromOpenF1(data: OpenF1Data): RaceWeekend[] {
  return openF1Weekends(data).map((w, idx) => ({
    round: idx + 1,
    meeting: w.meeting,
    sessions: w.sessions,
    isSprint: w.sessions.some(s => s.session_name.toLowerCase().includes('sprint')),
  }));
}

// ======= SEASON ROLLOVER =======

function raceEndTime(weekend: RaceWeekend): number {
  const race = weekend.sessions.find(s => s.session_name === 'Race' && !s.is_cancelled);
  if (race) return sessionEndTime(race);
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
 * Calendar for one season. The race list comes from Jolpica; OpenF1 adds session times.
 * - 'live': at least one weekend has its sessions from OpenF1
 * - 'provisional': every session comes from Jolpica's own schedule (OpenF1 has none yet)
 * - 'not-published': both services answered and neither has this season yet
 * - 'unavailable': the data couldn't be loaded, so we can't say whether it exists.
 *   The UI shows an error with Retry; there is no static fallback calendar.
 * If Jolpica has no calendar for the season (not published yet, or unreachable) but
 * OpenF1 does, OpenF1's own list is used (source: 'openf1', rounds numbered by date).
 */
export async function fetchSeasonCalendar(year: number): Promise<SeasonCalendar> {
  const [jolpica, meetings, sessions] = await Promise.all([
    fetchJolpicaCalendar(year),
    fetchMeetings(year),
    fetchSessions(year),
  ]);
  const openF1 = meetings && sessions ? { meetings, sessions } : null;

  if (jolpica && jolpica.length > 0) {
    const weekends = buildWeekendsFromJolpica(jolpica, openF1, year);
    return {
      year,
      weekends,
      totalRounds: jolpica.length,
      source: 'jolpica',
      status: weekends.some(w => !w.provisional) ? 'live' : 'provisional',
    };
  }

  const fallback = openF1 ? weekendsFromOpenF1(openF1) : [];
  if (fallback.some(w => w.sessions.length > 0)) {
    console.warn(`Jolpica has no ${year} calendar; using OpenF1's list with rounds numbered by date`);
    return { year, weekends: fallback, totalRounds: fallback.length, source: 'openf1', status: 'live' };
  }

  // "Not published" only when both services answered and neither has the season.
  // A failed request, or OpenF1 listing meetings without sessions, means we can't tell.
  const openF1Problem = !openF1 || fallback.length > 0;
  return {
    year,
    weekends: [],
    totalRounds: 0,
    source: null,
    status: jolpica && !openF1Problem ? 'not-published' : 'unavailable',
  };
}

/**
 * The highest round whose race has finished by `now` (0 if none). Pure.
 * Used to keep "After Round N" honest: Jolpica can report round N as soon as that
 * weekend's qualifying is in, while the points are still those after round N-1.
 */
export function lastFinishedRound(weekends: RaceWeekend[], now: Date): number {
  const nowMs = now.getTime();
  let last = 0;
  for (const w of weekends) {
    if (w.meeting.is_cancelled) continue;
    const race = w.sessions.find(s => s.session_name === 'Race' && !s.is_cancelled);
    // No race time known: it counts as finished once its race day is over
    const finishedAt = race ? sessionEndTime(race) : new Date(w.meeting.date_end).getTime();
    if (finishedAt <= nowMs) last = Math.max(last, w.round);
  }
  return last;
}

export type SeasonStatus = 'live' | 'provisional' | 'not-published' | 'unavailable';

export type HeroState =
  | { kind: 'race'; next: NextRaceInfo; provisional: boolean; targetTime: string | null }
  | { kind: 'complete'; completedYear: number; nextYear: number }
  | { kind: 'none' };

/**
 * What the hero shows for a season at time `now`. Pure.
 * - A known calendar: the next session of the first weekend not yet over. If its
 *   sessions come from Jolpica's schedule (`provisional`) the hero says times are
 *   confirmed closer to the date; with no time at all, the date only (no countdown).
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

  const next = findNextRace(season.weekends, now);
  if (!next) return { kind: 'none' };
  return {
    kind: 'race',
    next,
    provisional: !!next.race.provisional,
    targetTime: next.nextSession ? next.nextSession.date_start : null,
  };
}

/**
 * The weekend the hero should show at `now`, with the session that is LIVE right now
 * (started, not yet over) and the next upcoming one. Pure.
 * - A weekend stays current until its last session is over.
 * - A race with no known times is still upcoming until the end of its day.
 * - Once every race is over, the last weekend with nothing live or upcoming.
 */
export function findNextRace(weekends: RaceWeekend[], now: Date = new Date()): NextRaceInfo | null {
  const nowMs = now.getTime();

  for (const race of weekends) {
    const sorted = [...race.sessions].sort(byStart);

    if (sorted.length === 0) {
      if (new Date(race.meeting.date_end).getTime() > nowMs) {
        return { race, nextSession: null, liveSession: null, allSessions: [] };
      }
      continue;
    }

    const liveSession =
      sorted.find(s => new Date(s.date_start).getTime() <= nowMs && nowMs < sessionEndTime(s)) || null;
    const nextSession = sorted.find(s => new Date(s.date_start).getTime() > nowMs) || null;

    if (liveSession || nextSession) {
      return { race, nextSession, liveSession, allSessions: sorted };
    }
  }

  // All races passed, return the last one
  if (weekends.length > 0) {
    const last = weekends[weekends.length - 1];
    return {
      race: last,
      nextSession: null,
      liveSession: null,
      allSessions: [...last.sessions].sort(byStart)
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

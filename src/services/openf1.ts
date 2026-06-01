/**
 * OpenF1 API Service
 * Handles all data fetching from the OpenF1 API with caching and fallback
 * Base URL: https://api.openf1.org/v1/
 */

import { DRIVERS_STANDINGS as FALLBACK_DRIVERS, CONSTRUCTORS_STANDINGS as FALLBACK_CONSTRUCTORS } from '@/data/standings';

const API_BASE = 'https://api.openf1.org/v1';
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

export interface DriverChampEntry {
  meeting_key: number;
  session_key: number;
  driver_number: number;
  position_start: number | null;
  position_current: number;
  points_start: number | null;
  points_current: number;
}

export interface TeamChampEntry {
  meeting_key: number;
  session_key: number;
  team_name: string;
  position_start: number | null;
  position_current: number;
  points_start: number | null;
  points_current: number;
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

// ======= CHAMPIONSHIP STANDINGS =======

export async function fetchDriverChampionship(sessionKey?: number): Promise<DriverChampEntry[] | null> {
  const cacheKey = `driver_champ_${sessionKey || 'latest'}`;
  const cached = getCached<DriverChampEntry[]>(cacheKey);
  if (cached) return cached;

  const endpoint = sessionKey
    ? `/championship_drivers?session_key=${sessionKey}`
    : `/championship_drivers`;
  const data = await fetchJSON<DriverChampEntry[]>(endpoint);
  if (data) {
    // If no session_key, get entries with the highest session_key (most recent)
    if (!sessionKey && data.length > 0) {
      const maxSessionKey = Math.max(...data.map(d => d.session_key));
      const latest = data.filter(d => d.session_key === maxSessionKey);
      setCache(cacheKey, latest);
      return latest;
    }
    setCache(cacheKey, data);
    return data;
  }
  return null;
}

export async function fetchTeamChampionship(sessionKey?: number): Promise<TeamChampEntry[] | null> {
  const cacheKey = `team_champ_${sessionKey || 'latest'}`;
  const cached = getCached<TeamChampEntry[]>(cacheKey);
  if (cached) return cached;

  const endpoint = sessionKey
    ? `/championship_teams?session_key=${sessionKey}`
    : `/championship_teams`;
  const data = await fetchJSON<TeamChampEntry[]>(endpoint);
  if (data) {
    if (!sessionKey && data.length > 0) {
      const maxSessionKey = Math.max(...data.map(d => d.session_key));
      const latest = data.filter(d => d.session_key === maxSessionKey);
      setCache(cacheKey, latest);
      return latest;
    }
    setCache(cacheKey, data);
    return data;
  }
  return null;
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

export async function fetchEnrichedDriverStandings(): Promise<EnrichedDriverStanding[]> {
  const [champEntries, driverInfos] = await Promise.all([
    fetchDriverChampionship(),
    fetchDrivers()
  ]);

  if (!champEntries || champEntries.length === 0) {
    // Return fallback
   return FALLBACK_DRIVERS.map(d => ({
  position: d.position,
  firstName: d.firstName,
  lastName: d.lastName,
  team: d.team,
  teamColor: d.teamColor,
  points: d.points,
  wins: d.wins,
  driverNumber: 0,
  headshotUrl: ''
}));
  }

  // Sort by position
  const sorted = [...champEntries].sort((a, b) => a.position_current - b.position_current);

  return sorted.map(entry => {
  const info = driverInfos.find(
    d => d.driver_number === entry.driver_number
  );

  return {
    position: entry.position_current,
    firstName: info?.first_name || 'Driver',
    lastName: info?.last_name || `#${entry.driver_number}`,
    team: info?.team_name || 'Unknown',
    teamColor: info?.team_colour || '#999999',
    points: Math.round(entry.points_current),
    wins: 0,
    driverNumber: entry.driver_number,
    headshotUrl: info?.headshot_url || ''
  };
});
}

export async function fetchEnrichedConstructorStandings(): Promise<EnrichedConstructorStanding[]> {
  const champEntries = await fetchTeamChampionship();

  if (!champEntries || champEntries.length === 0) {
    return FALLBACK_CONSTRUCTORS;
  }

  const sorted = [...champEntries].sort((a, b) => a.position_current - b.position_current);

  // Map team names to approximate colors
  const teamColorMap: Record<string, string> = {
    'Red Bull Racing': '#1E41FF',
    'McLaren': '#FF8000',
    'Ferrari': '#DC0000',
    'Mercedes': '#27F4D2',
    'Aston Martin': '#006F62',
    'Williams': '#64C4FF',
    'RB': '#6692FF',
    'Racing Bulls': '#6692FF',
    'Haas F1 Team': '#B6BABD',
    'Alpine': '#FF87BC',
    'Kick Sauber': '#52E252',
  };

  return sorted.map(entry => ({
  position: entry.position_current,
  name: entry.team_name,
  teamColor: teamColorMap[entry.team_name] || '#999999',
  points: Math.round(entry.points_current),
  wins: 0
}));
}

// ======= FORCE REFRESH =======

export function clearCache(): void {
  cache.clear();
}

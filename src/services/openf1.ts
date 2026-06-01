/**
 * OpenF1 API Service - Fixed next race detection
 */

import { DRIVERS_STANDINGS as FALLBACK_DRIVERS, CONSTRUCTORS_STANDINGS as FALLBACK_CONSTRUCTORS } from '@/data/standings';

const API_BASE = 'https://api.openf1.org/v1';
const CACHE_DURATION = 60000;

// ======= TYPES (unchanged) =======
export interface Meeting { /* ... keep all your existing interfaces ... */ }
export interface Session { /* ... */ }
export interface RaceWeekend { /* ... */ }
export interface NextRaceInfo { /* ... */ }

// ... (keep all your cache, fetch functions, fetchMeetings, fetchSessions, etc. as they are) ...

// ======= CRITICAL FIX: findNextRace =======
export function findNextRace(weekends: RaceWeekend[]): NextRaceInfo | null {
  const now = new Date();

  for (const race of weekends) {
    const sortedSessions = [...race.sessions].sort(
      (a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
    );

    // Find first future session
    const nextSession = sortedSessions.find(s => new Date(s.date_start) > now);

    if (nextSession) {
      return {
        race,
        nextSession,
        allSessions: sortedSessions
      };
    }
  }

  // If no future races, return the last one
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

// Keep the rest of your file (getSessionDisplayName, fetchEnriched* functions, clearCache) unchanged

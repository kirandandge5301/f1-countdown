/**
 * The last race calendar that loaded successfully, kept in the browser so a visitor
 * who can't reach the schedule services still sees a calendar, clearly labelled
 * "as of <time>" (never passed off as live). Public schedule data only.
 *
 * Browser storage can be blocked or corrupted: every access is guarded and any
 * problem simply means "no saved calendar".
 */
import { hasUnfinishedRace, type RaceWeekend, type SeasonStatus } from '@/services/openf1';

const STORAGE_KEY = 'gpcountdown-calendar-v1';
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // a schedule older than this is too old to trust

export interface SavedCalendar {
  season: number;
  status: SeasonStatus;
  totalRounds: number;
  weekends: RaceWeekend[];
  savedAt: Date;
}

export function saveCalendar(
  cal: { season: number; status: SeasonStatus; totalRounds: number; weekends: RaceWeekend[] },
  savedAt: Date = new Date()
): void {
  if (cal.weekends.length === 0) return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ v: 1, savedAt: savedAt.toISOString(), ...cal })
    );
  } catch {
    // storage blocked or full: nothing saved, nothing lost
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function looksLikeWeekend(w: unknown): boolean {
  if (!isRecord(w) || typeof w.round !== 'number') return false;
  const meeting = w.meeting;
  if (!isRecord(meeting) || typeof meeting.meeting_name !== 'string' || typeof meeting.date_end !== 'string') return false;
  const sessions = w.sessions;
  return (
    Array.isArray(sessions) &&
    sessions.every(s => isRecord(s) && typeof s.session_name === 'string' && typeof s.date_start === 'string')
  );
}

/**
 * The saved calendar, if there is one and it can still be trusted: well-formed, not
 * older than 30 days, saved in the past, and its season still has a race left
 * (a finished season is not "the calendar" any more). Otherwise null.
 */
export function loadSavedCalendar(now: Date = new Date()): SavedCalendar | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || data.v !== 1) return null;

    const savedAt = new Date(data.savedAt);
    const age = now.getTime() - savedAt.getTime();
    if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) return null;

    if (typeof data.season !== 'number' || typeof data.totalRounds !== 'number') return null;
    if (!Array.isArray(data.weekends) || data.weekends.length === 0 || !data.weekends.every(looksLikeWeekend)) return null;
    if (!hasUnfinishedRace(data.weekends, now)) return null;

    return {
      season: data.season,
      status: data.status,
      totalRounds: data.totalRounds,
      weekends: data.weekends,
      savedAt,
    };
  } catch {
    return null;
  }
}

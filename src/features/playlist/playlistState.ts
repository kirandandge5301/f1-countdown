/** What the playlist section shows at a given moment. Pure: no clock reads, no fetching. */
import { sessionEndTime, type RaceWeekend, type SeasonStatus } from '@/services/openf1';
import { activeWeek, ms, type Content, type Playlist, type Track, type Week } from './content';

const HOUR = 3600_000;
const DAY = 24 * HOUR;
const IST = 5.5 * HOUR;

/** Monday 05:00 IST of the Monday-Sunday (IST) week that contains the race start minus 2 days. */
export function raceWeekStart(raceStartMs: number): number {
  const ist = new Date(raceStartMs - 2 * DAY + IST); // read with UTC getters = IST wall clock
  const sinceMonday = (ist.getUTCDay() + 6) % 7;
  const monday = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() - sinceMonday);
  return monday + 5 * HOUR - IST;
}

/** Race start and end; the end of race day for both when no time is published. */
export function raceMoment(w: RaceWeekend): { start: number; end: number } {
  const race = w.sessions.find(s => s.session_name === 'Race');
  if (race) return { start: ms(race.date_start), end: sessionEndTime(race) };
  const day = ms(w.meeting.date_end);
  return { start: day, end: day };
}

export interface CalendarInfo {
  weekends: RaceWeekend[];
  season: number;
  status: SeasonStatus | null;
}

export interface NextDrop {
  at: number;
  name: string;
}

export type PlaylistState =
  | { kind: 'upcoming'; week: Week; playlist: Playlist; nextAt: number; nextIsDrop: boolean }
  | {
      kind: 'daily'; week: Week; playlist: Playlist; revealed: Track[]; latest: Track; latestIsToday: boolean;
      day: number; days: number; nextAt: number; nextIsDrop: boolean;
    }
  | { kind: 'dropped'; week: Week; playlist: Playlist }
  | { kind: 'soon'; raceName: string }
  | {
      kind: 'waiting'; message: string; next: NextDrop | null; seasonOver: number | null;
      last: { week: Week; playlist: Playlist } | null;
    };

/** Jolpica's name for a content week's race, when that calendar is loaded. */
export function raceNameFor(week: Week, cal: CalendarInfo): string | null {
  if (week.kind !== 'race' || week.season !== cal.season) return null;
  return cal.weekends.find(w => w.round === week.round)?.meeting.meeting_name ?? null;
}

export function getPlaylistState(content: Content, cal: CalendarInfo, now: Date): PlaylistState {
  const t = now.getTime();
  const week = activeWeek(content, now);

  if (week?.playlist) {
    const playlist = week.playlist;
    const drop = ms(playlist.dropAt);
    if (t >= drop) return { kind: 'dropped', week, playlist };

    const revealed = playlist.tracks.filter(x => ms(x.revealAt) <= t);
    const upcoming = playlist.tracks.map(x => ms(x.revealAt)).filter(x => x > t);
    const nextAt = Math.min(drop, ...upcoming);
    const nextIsDrop = nextAt >= drop;
    if (revealed.length === 0) return { kind: 'upcoming', week, playlist, nextAt, nextIsDrop };

    // Days are counted from the week's start to the drop, not from how many tracks are in the
    // file: tracks are added one day at a time, so that would read "Day 1 of 1".
    const start = ms(week.startsAt);
    const dayOf = (x: number) => Math.floor((x - start) / DAY) + 1;
    const days = Math.max(1, Math.ceil((drop - start) / DAY));
    const latest = revealed[revealed.length - 1];
    return {
      kind: 'daily', week, playlist, revealed, latest,
      latestIsToday: dayOf(ms(latest.revealAt)) === dayOf(t),
      day: Math.min(dayOf(t), days), days, nextAt, nextIsDrop,
    };
  }

  const races = cal.weekends
    .filter(w => !w.meeting.is_cancelled)
    .map(w => ({ name: w.meeting.meeting_name, week: raceWeekStart(raceMoment(w).start), ...raceMoment(w) }));

  // A race week without a playlist yet. Once its race is over, "coming soon" would be untrue.
  if (week?.kind !== 'off') {
    const current = races.find(r => r.week <= t && t < r.end);
    if (current) return { kind: 'soon', raceName: current.name };
  }

  const nextWeek = content.weeks.find(w => w.playlist && ms(w.startsAt) > t);
  const nextRace = races.filter(r => r.week > t).sort((a, b) => a.week - b.week)[0];
  let next: NextDrop | null = null;
  if (nextWeek?.playlist) {
    const p = nextWeek.playlist;
    next = { at: ms(p.tracks[0]?.revealAt ?? p.dropAt), name: raceNameFor(nextWeek, cal) ?? p.title };
  } else if (nextRace) {
    next = { at: nextRace.week, name: nextRace.name };
  }

  let seasonOver: number | null = null;
  if (!next) {
    if (cal.status === 'not-published') seasonOver = cal.season;
    else if (races.length > 0 && races.every(r => r.end <= t)) seasonOver = cal.season + 1;
  }

  const past = content.weeks
    .filter((w): w is Week & { playlist: Playlist } => !!w.playlist && ms(w.playlist.dropAt) <= t)
    .sort((a, b) => ms(b.playlist.dropAt) - ms(a.playlist.dropAt))[0];

  return {
    kind: 'waiting',
    message: week?.offWeekMessage ?? content.defaultOffWeekMessage,
    next, seasonOver,
    last: past ? { week: past, playlist: past.playlist } : null,
  };
}

/** The next moment after `now` at which the state can change (null if nothing is known). */
export function nextPlaylistChange(content: Content | null, cal: CalendarInfo, now: Date): number | null {
  const t = now.getTime();
  const times: number[] = [];
  for (const w of content?.weeks ?? []) {
    const start = ms(w.startsAt);
    times.push(start, ms(w.endsAt));
    if (w.playlist) {
      const drop = ms(w.playlist.dropAt);
      times.push(drop, ...w.playlist.tracks.map(x => ms(x.revealAt)));
      for (let d = start + DAY; d < drop; d += DAY) times.push(d); // "Day N of M" moves on
    }
  }
  for (const w of cal.weekends) {
    const r = raceMoment(w);
    times.push(raceWeekStart(r.start), r.end);
  }
  const future = times.filter(x => Number.isFinite(x) && x > t);
  return future.length > 0 ? Math.min(...future) : null;
}

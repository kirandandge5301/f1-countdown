import { describe, expect, it } from 'vitest';
import { parseContent } from '@/features/playlist/content';
import { getPlaylistState, nextPlaylistChange, raceWeekStart, type CalendarInfo } from '@/features/playlist/playlistState';
import { at, cal2026, file, weekEntry } from './helpers';

const content = (...weeks: unknown[]) => parseContent(file(...weeks)).content!;
const qatar = content(weekEntry());
const run = (s: string, c = qatar, cal: CalendarInfo = cal2026) => getPlaylistState(c, cal, at(s));
const day = (d: number, time = '05:00') => `2026-11-${23 + d}T${time}:00+05:30`;

describe('race-week rule', () => {
  const iso = (s: string) => new Date(raceWeekStart(at(s).getTime())).toISOString();
  it('Qatar, Sunday 21:30 IST', () => expect(iso('2026-11-29T16:00:00Z')).toBe('2026-11-22T23:30:00.000Z'));
  it('Las Vegas, Sunday morning IST', () => expect(iso('2026-11-22T04:00:00Z')).toBe('2026-11-15T23:30:00.000Z'));
  it('Miami, Monday 01:30 IST, belongs to the week before', () =>
    expect(iso('2026-05-03T20:00:00Z')).toBe('2026-04-26T23:30:00.000Z'));
  it('Baku, Saturday race', () => expect(iso('2026-09-26T11:00:00Z')).toBe('2026-09-20T23:30:00.000Z'));
});

describe('timeline', () => {
  it('Monday 04:59 vs 05:00 IST', () => {
    expect(run(day(0, '04:59')).kind).toBe('waiting');
    expect(run(day(0))).toMatchObject({ kind: 'daily', day: 1, days: 4, latestIsToday: true, nextIsDrop: false });
  });

  it.each([0, 1, 2, 3])('daily reveal %i', d => {
    const before = run(day(d, '04:59'));
    const after = run(day(d));
    expect(after).toMatchObject({ kind: 'daily', day: d + 1 });
    if (after.kind === 'daily') expect(after.revealed).toHaveLength(d + 1);
    if (before.kind === 'daily') expect(before.revealed).toHaveLength(d);
  });

  it('Friday drop and end of week', () => {
    expect(run(day(4, '04:59'))).toMatchObject({ kind: 'daily', nextIsDrop: true });
    expect(run(day(4)).kind).toBe('dropped');
    expect(run(day(7, '04:59')).kind).toBe('dropped');
    expect(run(day(7)).kind).not.toBe('dropped');
  });

  it('upcoming before the first reveal', () => {
    const w = weekEntry();
    w.playlist.tracks = w.playlist.tracks.slice(1);
    expect(run(day(0, '06:00'), content(w))).toMatchObject({ kind: 'upcoming', nextIsDrop: false });
  });

  it('a week with no tracks yet points at the drop', () => {
    const w = weekEntry();
    w.playlist.tracks = [];
    expect(run(day(0, '06:00'), content(w))).toMatchObject({ kind: 'upcoming', nextIsDrop: true });
  });

  it('counts days properly when tracks are added one day at a time', () => {
    const w = weekEntry();
    w.playlist.tracks = w.playlist.tracks.slice(0, 1);
    expect(run(day(0), content(w))).toMatchObject({ day: 1, days: 4 });
    expect(run(day(1), content(w))).toMatchObject({ day: 2, latestIsToday: false });
  });

  it('back to back: Qatar to Abu Dhabi', () => {
    const move = (s: string) => new Date(at(s).getTime() + 7 * 86400e3).toISOString();
    const q = weekEntry();
    const a = weekEntry({
      id: '2026-r23', round: 23, startsAt: move(q.startsAt), endsAt: move(q.endsAt),
      playlist: {
        ...q.playlist,
        dropAt: move(q.playlist.dropAt),
        tracks: q.playlist.tracks.map(t => ({ ...t, revealAt: move(t.revealAt) })),
      },
    });
    const c = content(q, a);
    expect(run(day(7, '04:59'), c)).toMatchObject({ kind: 'dropped', week: { id: '2026-r22' } });
    expect(run(day(7), c)).toMatchObject({ kind: 'daily', week: { id: '2026-r23' }, day: 1 });
  });
});

describe('weeks without a playlist', () => {
  const none = content();

  it('soon in a race week, until the race is over', () => {
    expect(run(day(2), none)).toMatchObject({ kind: 'soon', raceName: 'Qatar Grand Prix' });
    expect(run('2026-11-30T00:00:00+05:30', none).kind).toBe('soon');
    expect(run('2026-11-30T03:00:00+05:30', none)).toMatchObject({ kind: 'waiting', message: null, next: { name: 'Abu Dhabi Grand Prix' } });
  });

  it('waiting computes the next drop from the calendar', () => {
    const s = run('2026-11-12T12:00:00Z', none);
    expect(s).toMatchObject({ kind: 'waiting', message: 'Waiting.', next: { name: 'Las Vegas Grand Prix' }, last: null });
    if (s.kind === 'waiting') expect(new Date(s.next!.at).toISOString()).toBe('2026-11-15T23:30:00.000Z');
  });

  it('waiting prefers the next entry', () =>
    expect(run('2026-11-12T12:00:00Z')).toMatchObject({ next: { name: 'Qatar Grand Prix' } }));

  it('off week shows its own message and the last playlist', () => {
    const c = content(weekEntry(), {
      id: 'offweek-2026-12-07', kind: 'off', offWeekMessage: 'Holiday.',
      startsAt: '2026-12-07T05:00:00+05:30', endsAt: '2026-12-14T05:00:00+05:30',
    });
    expect(run('2026-12-08T00:00:00Z', c)).toMatchObject({
      kind: 'waiting', message: 'Holiday.', seasonOver: 2027, last: { week: { id: '2026-r22' } },
    });
  });

  it('season over', () => {
    expect(run('2026-12-20T00:00:00Z', none)).toMatchObject({ kind: 'waiting', next: null, seasonOver: 2027 });
    const unpublished = { weekends: [], season: 2027, status: 'not-published' as const };
    expect(run('2026-12-20T00:00:00Z', none, unpublished)).toMatchObject({ seasonOver: 2027 });
  });

  it('claims nothing about the season when the calendar failed', () => {
    const failed = { weekends: [], season: 2026, status: 'unavailable' as const };
    expect(run('2026-12-20T00:00:00Z', none, failed)).toMatchObject({ message: null, next: null, seasonOver: null });
  });
});

it('next change is the next reveal', () => {
  expect(nextPlaylistChange(qatar, cal2026, at(day(0, '04:59')))).toBe(at(day(0)).getTime());
  expect(nextPlaylistChange(qatar, cal2026, at(day(0)))).toBe(at(day(1)).getTime());
  expect(nextPlaylistChange(null, { weekends: [], season: 2026, status: null }, at(day(0)))).toBeNull();
});

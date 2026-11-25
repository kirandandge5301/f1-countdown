import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildCountdownCard, buildPlaylistCard, buildQualifyingCard, cardFileName, cardHost } from '@/features/share/cardModel';
import { fitText } from '@/features/share/render';
import { bandEdges, FORMATS, LAYOUTS } from '@/features/share/layouts';
import { defaultEntry } from '@/features/share/defaultEntry';
import { formatClock, formatLeft, formatMoment } from '@/features/playlist/time';
import { parseContent, type Week } from '@/features/playlist/content';
import { parseQualifying, parseSeasonFastest } from '@/services/qualifying';
import { at, file, fixture, weekEntry, weekends2026 } from './helpers';

const qatar = weekends2026.find(w => w.round === 22)!;
const vegas = weekends2026.find(w => w.round === 21)!;
const rows = parseQualifying(fixture('qualifying-2026-r21'))!;
const seasonList = parseSeasonFastest(fixture('qualifying-p1-2026'))!;

const count = (now: string, layout: 'N8' | 'N7' = 'N8', weekend = qatar) =>
  buildCountdownCard({ weekend, season: 2026, now: at(now), timezone: 'Asia/Kolkata', totalRounds: 23, layout });

describe('countdown card', () => {
  it('3 days', () => {
    expect(count('2026-11-26T01:38:00Z')).toMatchObject({
      kicker: 'ROUND 22 / 23 · LUSAIL', title: 'Qatar Grand Prix', hero: '3', heroCaption: 'days to lights out',
      stamp: 'As of 26 Nov · 07:08 India (GMT+5:30)',
    });
    expect(count('2026-11-26T01:38:00Z', 'N7')).toMatchObject({ hero: '3d 14h 22m', heroCaption: 'to lights out' });
    expect(count('2026-11-26T01:38:00Z')!.details[0]).toBe('Sun 29 Nov · 21:30 India (GMT+5:30)');
  });
  it('1 day is singular', () => expect(count('2026-11-28T15:00:00Z')!.heroCaption).toBe('day to lights out'));
  it('under a day, under an hour, under a minute', () => {
    expect(count('2026-11-29T01:38:00Z')!.hero).toBe('14h 22m');
    expect(count('2026-11-29T15:18:00Z')!.hero).toBe('42m');
    expect(formatLeft(30_000)).toBe('<1m');
  });
  it('race live, then over', () => {
    expect(count('2026-11-29T16:20:00Z')).toMatchObject({ hero: 'LIVE', heroCaption: 'Race · live now' });
    expect(count('2026-11-29T20:00:00Z')).toBeNull();
  });
  it('another session live keeps the countdown', () => {
    const start = qatar.sessions.find(s => s.session_name === 'Practice 1')!.date_start;
    const card = count(new Date(at(start).getTime() + 60_000).toISOString())!;
    expect(card.hero).toBe('2');
    expect(card.details[0]).toBe('Practice 1 · live now');
  });
  it('time not published', () => {
    const tbc = {
      ...qatar,
      sessions: qatar.sessions.filter(s => s.session_name !== 'Race'),
      meeting: { ...qatar.meeting, date_end: '2026-11-29T23:59:59Z' },
    };
    expect(count('2026-11-26T00:00:00Z', 'N8', tbc)).toMatchObject({ hero: '29 Nov', heroCaption: 'race day · time TBC' });
  });
  it('says so when the calendar is not fresh', () => {
    const card = buildCountdownCard({
      weekend: qatar, season: 2026, now: at('2026-11-26T00:00:00Z'), timezone: 'UTC', totalRounds: 23, layout: 'N8',
      staleSince: at('2026-11-25T10:00:00Z'),
    })!;
    expect(card.details.join()).toContain('Calendar as of 25 Nov · 10:00');
  });
  it('midnight reads 00:00', () => {
    expect(formatClock(at('2026-11-29T00:00:00Z').getTime(), 'UTC')).toBe('00:00');
    expect(formatMoment(at('2026-09-06T13:00:00Z').getTime(), 'Europe/London')).toBe('Sun 6 Sep · 14:00 London (GMT+1)');
  });
});

describe('fastest-in-qualifying card', () => {
  const build = (r = rows, list: typeof seasonList | null = seasonList) =>
    buildQualifyingCard({ weekend: vegas, season: 2026, rows: r, seasonList: list });

  it('Las Vegas: fastest is Antonelli, and the card never claims pole', () => {
    const card = build()!;
    expect(card).toMatchObject({
      subject: { name: 'Andrea Kimi Antonelli', team: 'Mercedes' }, hero: '1:33.893', heroCaption: 'Best lap · Q3',
      details: ['+0.258s to Verstappen', '8th time fastest in qualifying in 2026'],
    });
    expect(card.tagline).toBeUndefined();
    expect(JSON.stringify(card)).not.toMatch(/pole/i);
    expect(cardFileName(card, 'post')).toBe('gpcountdown-qualifying-2026-r21-post.png');
  });
  it('missing Q3 falls back to Q2 and compares like with like', () => {
    const r = rows.map(x => (x.position === 1 ? { ...x, q3: undefined } : x));
    expect(build(r)).toMatchObject({ hero: '1:35.086', heroCaption: 'Best lap · Q2' });
    expect(build(r)!.details.join()).not.toContain('Verstappen'); // P2 was faster in Q2: no negative gap
  });
  it('no P2 time, no gap; no season list, no count', () => {
    const r = rows.map(x => (x.position === 2 ? { ...x, q3: undefined } : x));
    expect(build(r, null)!.details).toEqual([]);
  });
  it('a list without this round gives no count', () =>
    expect(build(rows, seasonList.filter(x => x.round < 21))!.details).toHaveLength(1));
  it('unpublished gives no card', () => expect(build([])).toBeNull());
});

describe('playlist card', () => {
  const week = parseContent(file(weekEntry())).content!.weeks[0];
  it('has no track names', () => {
    const card = buildPlaylistCard({ week, raceName: 'Qatar Grand Prix', season: 2026, baseUrl: './' })!;
    expect(card).toMatchObject({ kicker: 'RACE-WEEK PLAYLIST · ROUND 22', heroCaption: '6 tracks', details: ['Spotify'] });
    expect(JSON.stringify(card)).not.toMatch(/Test \d|Test artist/);
  });
  it('cover and off week', () => {
    const off: Week = { ...week, kind: 'off', round: undefined, playlist: { ...week.playlist!, cover: 'playlists/a.png' } };
    expect(buildPlaylistCard({ week: off, raceName: null, season: 2026, baseUrl: './' })).toMatchObject({
      kicker: 'OFF-WEEK PLAYLIST', title: 'Test week', cover: './playlists/a.png', heroCaption: 'Out now · 6 tracks', round: null,
    });
  });
});

describe('drawing rules', () => {
  const measure = (t: string, size: number) => t.length * size * 0.5;
  it('wraps, shrinks, then ellipsis; never too wide', () => {
    for (const text of ['Short', 'Bahrain Grand Prix in Malaysia', 'x'.repeat(200), 'word '.repeat(80).trim()]) {
      const fit = fitText(measure, text, 920, 116, 56, 2);
      expect(fit.lines.length).toBeLessThanOrEqual(2);
      for (const l of fit.lines) expect(measure(l, fit.size)).toBeLessThanOrEqual(920);
    }
  });
  it('the red title is never on grey, and bands fill the card', () => {
    for (const layout of Object.values(LAYOUTS)) {
      expect(layout.bands.filter(b => [...b.top, ...b.bottom].includes('title')).every(b => b.color !== 'grey')).toBe(true);
      for (const f of ['story', 'post'] as const) {
        expect(bandEdges(layout, f, 'countdown').at(-1)!.y1).toBe(FORMATS[f].h);
      }
    }
  });
  it('url line only for a short host', () => {
    expect(cardHost('https://gpcountdown.com')).toBe('gpcountdown.com');
    expect(cardHost('https://f1-countdown-pearl.vercel.app')).toBeUndefined();
    expect(cardHost(undefined)).toBeUndefined();
  });
});

describe('studio', () => {
  it('builds a valid entry with the default times', () => {
    const entry = defaultEntry(qatar, 2026);
    expect(parseContent(file(JSON.parse(JSON.stringify(entry)))).errors).toEqual([]);
    expect(entry.startsAt).toBe('2026-11-23T05:00:00+05:30');
    expect(entry.playlist!.dropAt).toBe('2026-11-27T05:00:00+05:30');
    expect(entry.playlist!.tracks.at(-1)!.revealAt).toBe('2026-11-26T05:00:00+05:30');
  });
  it('placeholders never reach the real file', () =>
    expect(readFileSync('public/content/race-weeks.json', 'utf8')).not.toContain('REPLACE ME'));
});

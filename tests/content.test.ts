import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { parseContent } from '@/features/playlist/content';
import { file, weekEntry } from './helpers';

const pl = (over: Record<string, unknown>) => ({ playlist: { ...weekEntry().playlist, ...over } });
const track = (over: Record<string, unknown>) =>
  pl({ tracks: [{ title: 'T', artist: 'A', revealAt: '2026-11-23T05:00:00+05:30', ...over }] });

describe('content schema', () => {
  it('accepts a valid week', () => {
    const r = parseContent(file(weekEntry()));
    expect(r.errors).toEqual([]);
    expect(r.content?.weeks).toHaveLength(1);
  });

  const rules: Array<[string, Record<string, unknown>]> = [
    ['no offset in a date', { startsAt: '2026-11-23T05:00:00' }],
    ['end before start', { endsAt: '2026-11-22T05:00:00+05:30' }],
    ['race without round', { round: undefined }],
    ['race without season', { season: undefined }],
    ['off week with round', { kind: 'off' }],
    ['unknown kind', { kind: 'test' }],
    ['long tagline', { tagline: 'x'.repeat(46) }],
    ['bad layout', { layout: 'N1' }],
    ['bad hashtag', { hashtag: 'Qatar GP' }],
    ['bad id', { id: 'Has Spaces' }],
    ['live facts (unknown field)', { pole: 'someone' }],
    ['long playlist title', pl({ title: 'x'.repeat(61) })],
    ['cover outside playlists/', pl({ cover: '../secret.png' })],
    ['cover type', pl({ cover: 'playlists/a.gif' })],
    ['remote cover', pl({ cover: 'https://example.com/a.png' })],
    ['http link', pl({ links: { spotify: 'http://open.spotify.com/playlist/a' } })],
    ['wrong host', pl({ links: { spotify: 'https://example.com/playlist/a' } })],
    ['lookalike host', pl({ links: { appleMusic: 'https://music.apple.com.example.com/a' } })],
    ['drop outside week', pl({ dropAt: '2026-12-10T05:00:00+05:30' })],
    ['reveal before week', track({ revealAt: '2026-11-22T05:00:00+05:30' })],
    ['reveal after drop', track({ revealAt: '2026-11-28T05:00:00+05:30' })],
    ['long note', track({ note: 'x'.repeat(81) })],
    ['missing artist', track({ artist: undefined })],
    ['unsorted tracks', pl({ tracks: [...weekEntry().playlist.tracks].reverse() })],
  ];
  it.each(rules)('rejects: %s', (_name, over) => {
    const r = parseContent(file(weekEntry(over)));
    expect(r.errors.length).toBeGreaterThan(0);
    expect(r.content?.weeks).toHaveLength(0);
  });

  it('skips duplicates, overlaps and broken entries but keeps the good one', () => {
    const r = parseContent(file(weekEntry(), weekEntry(), weekEntry({ id: 'other' }), 'nonsense'));
    expect(r.content?.weeks).toHaveLength(1);
    expect(r.errors.join()).toMatch(/duplicate/);
    expect(r.errors.join()).toMatch(/overlaps/);
  });

  it('rejects an unusable file', () => {
    expect(parseContent(null).content).toBeNull();
    expect(parseContent({ version: 2, weeks: [] }).content).toBeNull();
  });
});

describe('the real race-weeks.json', () => {
  const r = parseContent(JSON.parse(readFileSync('public/content/race-weeks.json', 'utf8')));
  it('has zero errors', () => expect(r.errors).toEqual([]));
  it('has every cover, at most 600 KB', () => {
    for (const w of r.content!.weeks) {
      if (!w.playlist?.cover) continue;
      const path = `public/${w.playlist.cover}`;
      expect(existsSync(path), path).toBe(true);
      expect(statSync(path).size, path).toBeLessThanOrEqual(600 * 1024);
    }
  });
});

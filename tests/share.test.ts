import { expect, it } from 'vitest';
import { buildCountdownCard, buildPlaylistCard, buildQualifyingCard, type CardModel } from '@/features/share/cardModel';
import { caption, facebookUrl, raceHashtag, shareLink, whatsappUrl, xUrl } from '@/features/share/share';
import { qualifyingWindow } from '@/features/share/useQualifying';
import { parseContent } from '@/features/playlist/content';
import { parseQualifying } from '@/services/qualifying';
import { at, file, fixture, weekEntry, weekends2026 } from './helpers';

const qatar = weekends2026.find(w => w.round === 22)!;
const countdown = (tagline?: string) => buildCountdownCard({
  weekend: qatar, season: 2026, now: at('2026-11-26T01:38:00Z'), timezone: 'UTC', totalRounds: 23, layout: 'N8', tagline,
})!;
const qualifying = buildQualifyingCard({
  weekend: weekends2026.find(w => w.round === 21)!, season: 2026, rows: parseQualifying(fixture('qualifying-2026-r21'))!, seasonList: null,
})!;
const playlist = buildPlaylistCard({
  week: parseContent(file(weekEntry())).content!.weeks[0], raceName: 'Qatar Grand Prix', season: 2026, baseUrl: './', tagline: 'Hello.',
})!;

it('captions', () => {
  expect(caption(countdown('Night race.'))).toBe('Qatar Grand Prix: 3 days to lights out. Night race. #F1 #QatarGP');
  expect(caption(countdown())).toBe('Qatar Grand Prix: 3 days to lights out. #F1 #QatarGP');
  expect(caption(qualifying)).toBe('Fastest in qualifying at the Las Vegas Grand Prix: Andrea Kimi Antonelli (Mercedes), 1:33.893. #F1 #LasVegasGP');
  expect(caption(playlist)).toBe('The Qatar Grand Prix race-week playlist is out. Hello. #F1 #QatarGP');
  expect(caption(countdown(), '#Custom')).toContain('#Custom');
});

it('no caption is ever longer than 280 with the link counted as 23', () => {
  const long: CardModel = { ...countdown('x'.repeat(45)), title: 'Very Long '.repeat(40) };
  for (const m of [countdown('x'.repeat(45)), qualifying, playlist, long]) {
    expect(caption(m).length + 1 + 23).toBeLessThanOrEqual(280);
  }
  expect(caption(long)).toContain('#F1');
});

it('hashtags', () => {
  expect(raceHashtag('Qatar Grand Prix')).toBe('#QatarGP');
  expect(raceHashtag('São Paulo Grand Prix')).toBe('#SaoPauloGP');
  expect(raceHashtag('Bahrain Grand Prix in Malaysia')).toBe('#BahrainGPinMalaysia');
});

it('links', () => {
  expect(shareLink('https://a.b', countdown(), 'x')).toBe('https://a.b/?utm_source=x&utm_medium=social&utm_campaign=countdown-2026-r22');
  expect(shareLink('https://a.b', playlist, 'copy')).toMatch(/campaign=playlist-2026-r22#playlist$/);
  expect(shareLink('https://a.b', { ...playlist, round: null }, 'copy')).toContain('playlist-2026-offweek');
  expect(xUrl('a b', 'https://a.b/?c=d')).toBe('https://x.com/intent/tweet?text=a%20b&url=https%3A%2F%2Fa.b%2F%3Fc%3Dd');
  expect(facebookUrl('https://a.b')).toBe('https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fa.b');
  expect(whatsappUrl('hi #F1', 'https://a.b')).toBe('https://wa.me/?text=hi%20%23F1%20https%3A%2F%2Fa.b');
});

it('qualifying is offered from its end until race start + 3 h', () => {
  const round = (s: string) => qualifyingWindow(weekends2026, at(s))?.round ?? null;
  expect(round('2026-11-28T20:59:00Z')).toBeNull(); // no end time known: 3 h allowed
  expect(round('2026-11-28T21:00:00Z')).toBe(22);
  expect(round('2026-11-29T18:59:00Z')).toBe(22);
  expect(round('2026-11-29T19:00:00Z')).toBeNull();
});

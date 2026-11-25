import { readFileSync } from 'node:fs';
import { buildWeekendsFromJolpica, type JolpicaRace } from '@/services/openf1';

export const fixture = (name: string) => JSON.parse(readFileSync(`docs/share-cards/fixtures/${name}.json`, 'utf8'));
export const races2026: JolpicaRace[] = fixture('calendar-2026').MRData.RaceTable.Races;
export const weekends2026 = buildWeekendsFromJolpica(races2026, null, 2026);
export const cal2026 = { weekends: weekends2026, season: 2026, status: 'provisional' as const };
export const at = (s: string) => new Date(s);

/** A made-up Qatar week, for tests only. */
export function weekEntry(over: Record<string, unknown> = {}) {
  const day = (d: number) => `2026-11-${23 + d}T05:00:00+05:30`;
  return {
    id: '2026-r22', kind: 'race', season: 2026, round: 22, startsAt: day(0), endsAt: day(7), layout: 'N8',
    playlist: {
      title: 'Test week', dropAt: day(4),
      links: { spotify: 'https://open.spotify.com/playlist/abc' },
      tracks: [0, 1, 2, 3, 4, 4].map((d, i) => ({ title: `Test ${i + 1}`, artist: 'Test artist', revealAt: day(d) })),
    },
    ...over,
  };
}

export const file = (...weeks: unknown[]) => ({ version: 1, defaultOffWeekMessage: 'Waiting.', weeks });

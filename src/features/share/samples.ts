/** Dev only (/?studio&export=samples): renders the sample matrix into docs/share-cards/samples/. */
import calendar from '../../../docs/share-cards/fixtures/calendar-2026.json';
import qualifying from '../../../docs/share-cards/fixtures/qualifying-2026-r21.json';
import seasonP1 from '../../../docs/share-cards/fixtures/qualifying-p1-2026.json';
import { buildWeekendsFromJolpica, type JolpicaRace } from '@/services/openf1';
import { parseQualifying, parseSeasonFastest } from '@/services/qualifying';
import type { LayoutId, Week } from '@/features/playlist/content';
import { buildCountdownCard, buildPlaylistCard, buildQualifyingCard, type CardModel, type Format } from './cardModel';
import { renderPng } from './render';

const IST = 'Asia/Kolkata';
const weekends = buildWeekendsFromJolpica(calendar.MRData.RaceTable.Races as JolpicaRace[], null, 2026)
  .map(w => ({ ...w, provisional: false }));
const round = (n: number) => weekends.find(w => w.round === n)!;

function testCover(): Promise<string> {
  const c = document.createElement('canvas');
  c.width = c.height = 800;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#B5B5B5';
  ctx.fillRect(0, 0, 800, 800);
  ctx.fillStyle = '#111111';
  ctx.font = '700 96px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('TEST COVER', 400, 430);
  return new Promise(resolve => c.toBlob(b => resolve(URL.createObjectURL(b!))));
}

function cards(layout: LayoutId, cover: string): Array<[string, CardModel | null]> {
  const rows = parseQualifying(qualifying)!;
  const seasonList = parseSeasonFastest(seasonP1);
  const count = (n: number, now: string, tagline?: string, weekend = round(n)) => buildCountdownCard({
    weekend, season: 2026, now: new Date(now), timezone: IST, totalRounds: 23, layout, tagline,
  });
  const week: Week = {
    id: 'test', kind: 'race', season: 2026, round: 22,
    startsAt: '2026-11-23T05:00:00+05:30', endsAt: '2026-11-30T05:00:00+05:30',
    playlist: {
      title: 'Test', dropAt: '2026-11-27T05:00:00+05:30',
      links: { spotify: 'https://open.spotify.com/x', appleMusic: 'https://music.apple.com/x', youtubeMusic: 'https://music.youtube.com/x' },
      tracks: Array.from({ length: 12 }, () => ({ title: 'T', artist: 'A', revealAt: '2026-11-27T05:00:00+05:30' })),
    },
  };
  const playlist = buildPlaylistCard({ week, raceName: 'Qatar Grand Prix', season: 2026, baseUrl: '', tagline: 'Sample tagline here' });
  const malaysia = round(16);
  const tbc = { ...round(22), sessions: round(22).sessions.filter(s => s.session_name !== 'Race') };
  tbc.meeting = { ...tbc.meeting, date_end: '2026-11-29T23:59:59Z' };

  return [
    ['countdown-days', count(22, '2026-11-26T01:38:00Z', 'Sample tagline here')],
    ['countdown-hours', count(22, '2026-11-29T01:38:00Z', 'Sample tagline here')],
    ['countdown-live', count(22, '2026-11-29T16:20:00Z', 'Sample tagline here')],
    ['qualifying', buildQualifyingCard({ weekend: round(21), season: 2026, rows, seasonList })],
    ['playlist', playlist && { ...playlist, cover, heroCaption: 'Out now · 12 tracks' }],
    ['edge-malaysia-45', count(16, '2026-10-01T01:00:00Z', 'A tagline that is forty-five characters long!', malaysia)],
    ['edge-malaysia-qualifying', buildQualifyingCard({ weekend: malaysia, season: 2026, rows, seasonList: seasonList!.map(x => x.round === 16 ? { ...x, driverId: 'antonelli' } : x) })],
    ['edge-saopaulo-none', count(20, '2026-11-07T18:30:00Z', undefined, { ...round(20), meeting: { ...round(20).meeting, meeting_name: 'São Paulo Grand Prix' } })],
    ['edge-tbc', count(22, '2026-11-26T01:38:00Z', undefined, tbc)],
  ];
}

export async function exportSamples(log: (line: string) => void): Promise<void> {
  const cover = await testCover();
  for (const layout of ['N8', 'N7', 'N3'] as LayoutId[]) {
    for (const [name, model] of cards(layout, cover)) {
      for (const format of ['story', 'post'] as Format[]) {
        if (!model) {
          log(`MISSING ${layout} ${name}`);
          continue;
        }
        const png = await renderPng(model, { layout, format });
        const file = `${layout.toLowerCase()}-${name}-${format}.png`;
        const resp = await fetch(`/__samples/${file}`, { method: 'POST', body: png });
        log(`${resp.status} ${file} ${Math.round(png.size / 1024)} KB`);
      }
    }
  }
  log('DONE');
}

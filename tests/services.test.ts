import { expect, it } from 'vitest';
import { appleMusicEmbed, embedFor, spotifyEmbed } from '@/features/playlist/embeds';
import { parseQualifying, parseSeasonFastest } from '@/services/qualifying';
import { fixture } from './helpers';

it('reads the Las Vegas qualifying result', () => {
  const rows = parseQualifying(fixture('qualifying-2026-r21'))!;
  expect(rows).toHaveLength(22);
  expect(rows[0]).toMatchObject({ position: 1, firstName: 'Andrea Kimi', lastName: 'Antonelli', q3: '1:33.893' });
  expect(rows[10].q3).toBeUndefined();
});

it('unpublished is empty, broken is null', () => {
  expect(parseQualifying(fixture('qualifying-2026-r22-unpublished'))).toEqual([]);
  expect(parseQualifying({})).toBeNull();
  expect(parseSeasonFastest(null)).toBeNull();
});

it('keeps one P1 per round', () => {
  const list = parseSeasonFastest(fixture('qualifying-p1-2026'))!;
  expect(list).toHaveLength(21);
  expect(list.filter(x => x.driverId === 'antonelli')).toHaveLength(8);
});

it('spotify strips ?si= and the language prefix', () => {
  expect(spotifyEmbed('https://open.spotify.com/track/abc123?si=zzz'))
    .toMatchObject({ src: 'https://open.spotify.com/embed/track/abc123', height: 152 });
  expect(spotifyEmbed('https://open.spotify.com/intl-de/playlist/abc'))
    .toMatchObject({ src: 'https://open.spotify.com/embed/playlist/abc', height: 352 });
  expect(spotifyEmbed('https://example.com/track/abc')).toBeNull();
  expect(spotifyEmbed('not a link')).toBeNull();
});

it('apple album ?i=, song and playlist', () => {
  expect(appleMusicEmbed('https://music.apple.com/in/album/x/1?i=2&uo=4'))
    .toMatchObject({ src: 'https://embed.music.apple.com/in/album/x/1?i=2', height: 175 });
  expect(appleMusicEmbed('https://music.apple.com/in/song/x/2'))
    .toMatchObject({ src: 'https://embed.music.apple.com/in/song/x/2', height: 175 });
  expect(appleMusicEmbed('https://music.apple.com/in/playlist/x/pl.abc?l=en'))
    .toMatchObject({ src: 'https://embed.music.apple.com/in/playlist/x/pl.abc', height: 450 });
  expect(appleMusicEmbed('https://music.apple.com/in/artist/x/2')).toBeNull();
});

it('youtube music is link only', () => {
  expect(embedFor('youtubeMusic', 'https://music.youtube.com/playlist?list=a')).toBeNull();
  expect(embedFor('spotify', undefined)).toBeNull();
});

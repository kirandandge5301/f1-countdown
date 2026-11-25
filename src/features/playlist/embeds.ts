/** Turns the links Kiran pastes into player (iframe) addresses. Pure. */
import type { Service } from './content';

export interface Embed {
  src: string;
  height: number;
  allow: string;
}

function parse(link: string, host: string): URL | null {
  try {
    const url = new URL(link);
    return url.protocol === 'https:' && url.host === host ? url : null;
  } catch {
    return null;
  }
}

export function spotifyEmbed(link: string): Embed | null {
  const url = parse(link, 'open.spotify.com');
  const m = url?.pathname.match(/^\/(?:intl-[a-z-]+\/)?(track|playlist)\/([A-Za-z0-9]+)\/?$/);
  if (!m) return null;
  return {
    src: `https://open.spotify.com/embed/${m[1]}/${m[2]}`, // drops ?si= and friends
    height: m[1] === 'track' ? 152 : 352,
    allow: 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture',
  };
}

export function appleMusicEmbed(link: string): Embed | null {
  const url = parse(link, 'music.apple.com');
  if (!url) return null;
  const path = url.pathname.replace(/\/$/, '');
  const kind = path.match(/^\/[a-z]{2}\/(album|song|playlist)\/.+$/)?.[1];
  if (!kind) return null;
  const songId = kind === 'album' ? url.searchParams.get('i') : null;
  return {
    src: `https://embed.music.apple.com${path}${songId ? `?i=${encodeURIComponent(songId)}` : ''}`,
    height: kind === 'song' || songId ? 175 : 450,
    allow: 'autoplay *; encrypted-media *',
  };
}

/** YouTube Music refuses to be embedded: link only. */
export function embedFor(service: Service, link: string | undefined): Embed | null {
  if (!link) return null;
  if (service === 'spotify') return spotifyEmbed(link);
  if (service === 'appleMusic') return appleMusicEmbed(link);
  return null;
}

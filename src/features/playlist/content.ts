/**
 * Kiran's editorial content (public/content/race-weeks.json): taglines, layouts, playlists.
 * Never live facts. An invalid week is skipped with a warning; it can never break the page.
 */
import * as z from 'zod/mini';

const HOSTS = {
  spotify: 'open.spotify.com',
  appleMusic: 'music.apple.com',
  youtubeMusic: 'music.youtube.com',
} as const;

export type Service = keyof typeof HOSTS;
export const SERVICES: Service[] = ['spotify', 'appleMusic', 'youtubeMusic'];
export const SERVICE_NAMES: Record<Service, string> = {
  spotify: 'Spotify',
  appleMusic: 'Apple Music',
  youtubeMusic: 'YouTube Music',
};

const serviceLink = (service: Service) =>
  z.optional(z.string().check(z.refine(value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.host === HOSTS[service] && !url.username;
    } catch {
      return false;
    }
  }, `must be an https link to ${HOSTS[service]}`)));

const linksSchema = z.strictObject({
  spotify: serviceLink('spotify'),
  appleMusic: serviceLink('appleMusic'),
  youtubeMusic: serviceLink('youtubeMusic'),
});

const text = (max: number) => z.string().check(z.minLength(1), z.maxLength(max));
// ISO 8601 with an explicit offset, e.g. 2026-11-30T05:00:00+05:30
const moment = z.iso.datetime({ offset: true });

const trackSchema = z.strictObject({
  title: text(120),
  artist: text(120),
  revealAt: moment,
  note: z.optional(text(80)),
  links: z.optional(linksSchema),
});

const playlistSchema = z.strictObject({
  title: text(60),
  cover: z.optional(z.string().check(z.regex(/^playlists\/[A-Za-z0-9_-][A-Za-z0-9._-]*\.(jpg|png|webp)$/))),
  links: z.optional(linksSchema),
  dropAt: moment,
  tracks: z.array(trackSchema),
});

const weekSchema = z.strictObject({
  id: z.string().check(z.regex(/^[a-z0-9-]+$/)),
  kind: z.enum(['race', 'off']),
  season: z.optional(z.int().check(z.gte(2000))),
  round: z.optional(z.int().check(z.gte(1))),
  startsAt: moment,
  endsAt: moment,
  tagline: z.optional(text(45)),
  hashtag: z.optional(z.string().check(z.regex(/^#[A-Za-z0-9_]{1,40}$/))),
  layout: z.optional(z.enum(['N8', 'N7', 'N3'])),
  playlist: z.optional(playlistSchema),
  offWeekMessage: z.optional(text(240)),
});

const fileSchema = z.strictObject({
  version: z.literal(1),
  defaultOffWeekMessage: text(240),
  weeks: z.array(z.unknown()),
});

export type Track = z.infer<typeof trackSchema>;
export type Playlist = z.infer<typeof playlistSchema>;
export type Week = z.infer<typeof weekSchema>;
export type LayoutId = NonNullable<Week['layout']>;

export interface Content {
  defaultOffWeekMessage: string;
  /** valid weeks, sorted by start, never overlapping */
  weeks: Week[];
}

export const ms = (iso: string) => new Date(iso).getTime();

function crossFieldErrors(week: Week): string[] {
  const errors: string[] = [];
  const start = ms(week.startsAt);
  const end = ms(week.endsAt);
  if (start >= end) errors.push('startsAt must be before endsAt');
  if (week.kind === 'race' && (!week.season || !week.round)) errors.push('a race week needs season and round');
  if (week.kind === 'off' && week.round !== undefined) errors.push('an off week has no round');

  const p = week.playlist;
  if (p) {
    const drop = ms(p.dropAt);
    if (drop < start || drop >= end) errors.push('dropAt must be inside the week');
    p.tracks.forEach((t, i) => {
      const at = ms(t.revealAt);
      if (at < start || at > drop) errors.push(`track ${i + 1}: revealAt must be between startsAt and dropAt`);
      if (i > 0 && at < ms(p.tracks[i - 1].revealAt)) errors.push(`track ${i + 1}: tracks must be sorted by revealAt`);
    });
  }
  return errors;
}

const describe = (error: { issues: ReadonlyArray<{ path: PropertyKey[]; message: string }> }) =>
  error.issues.map(i => `${i.path.map(String).join('.') || '(entry)'}: ${i.message}`);

/** Checks the whole file. `content` is null only when the file itself is unusable. Pure. */
export function parseContent(raw: unknown): { content: Content | null; errors: string[] } {
  const file = fileSchema.safeParse(raw);
  if (!file.success) return { content: null, errors: describe(file.error) };

  const errors: string[] = [];
  const weeks: Week[] = [];
  file.data.weeks.forEach((entry, i) => {
    const parsed = weekSchema.safeParse(entry);
    if (!parsed.success) {
      errors.push(...describe(parsed.error).map(e => `week ${i + 1}: ${e}`));
      return;
    }
    const week = parsed.data;
    const problems = crossFieldErrors(week);
    if (weeks.some(w => w.id === week.id)) problems.push(`duplicate id ${week.id}`);
    const clash = weeks.find(w => ms(w.startsAt) < ms(week.endsAt) && ms(week.startsAt) < ms(w.endsAt));
    if (clash) problems.push(`overlaps ${clash.id}`);
    if (problems.length > 0) errors.push(...problems.map(p => `week ${i + 1} (${week.id}): ${p}`));
    else weeks.push(week);
  });

  weeks.sort((a, b) => ms(a.startsAt) - ms(b.startsAt));
  return { content: { defaultOffWeekMessage: file.data.defaultOffWeekMessage, weeks }, errors };
}

let warned = '';
function warnOnce(message: string) {
  if (message === warned) return;
  warned = message;
  console.warn(message);
}

/** null when it can't be loaded or used. Never throws. */
export async function fetchContent(): Promise<Content | null> {
  try {
    const resp = await fetch(`${import.meta.env.BASE_URL}content/race-weeks.json`, { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const { content, errors } = parseContent(await resp.json());
    if (errors.length > 0) warnOnce(`race-weeks.json: ${errors.join('; ')}`);
    return content;
  } catch (err) {
    warnOnce(`race-weeks.json could not be loaded: ${String(err)}`);
    return null;
  }
}

/** The content week covering `now`, if any. */
export function activeWeek(content: Content | null, now: Date): Week | null {
  const t = now.getTime();
  return content?.weeks.find(w => ms(w.startsAt) <= t && t < ms(w.endsAt)) ?? null;
}

/** The entry for a race, whenever it is. */
export function weekForRace(content: Content | null, season: number, round: number): Week | null {
  return content?.weeks.find(w => w.kind === 'race' && w.season === season && w.round === round) ?? null;
}

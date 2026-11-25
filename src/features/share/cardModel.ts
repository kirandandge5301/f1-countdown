/** Works out the words on each share card. Pure: live data, content, `now` and time zone go in. */
import { getSessionDisplayName, sessionEndTime, type RaceWeekend } from '@/services/openf1';
import type { QualifyingRow, SeasonFastest } from '@/services/qualifying';
import { SERVICES, SERVICE_NAMES, type LayoutId, type Week } from '@/features/playlist/content';
import { formatDay, formatLeft, formatMoment } from '@/features/playlist/time';

// "qualifying" is the brief's "pole" card: Jolpica knows who was fastest, not who holds pole.
export type CardType = 'countdown' | 'qualifying' | 'playlist';
export type Format = 'story' | 'post';

export interface CardModel {
  type: CardType;
  season: number;
  /** null for an off week's playlist */
  round: number | null;
  kicker: string;
  title: string;
  tagline?: string;
  subject?: { name: string; team: string };
  hero: string;
  heroCaption: string;
  details: string[];
  stamp?: string;
  wordmark: string;
  /** site host, only when it is short enough */
  url?: string;
  /** same-origin image path, drawn instead of the hero text */
  cover?: string;
  /** one sentence for captions, e.g. "3 days to lights out" */
  summary: string;
}

const DAY = 24 * 3600_000;
const WORDMARK = 'GPCOUNTDOWN';

/** The card's URL line: only a configured host of at most 24 characters. */
export function cardHost(siteUrl: string | undefined): string | undefined {
  if (!siteUrl) return undefined;
  try {
    const host = new URL(siteUrl).host;
    return host.length <= 24 ? host : undefined;
  } catch {
    return undefined;
  }
}

interface Common {
  weekend: RaceWeekend;
  season: number;
  now: Date;
  timezone: string;
  siteUrl?: string;
}

export interface CountdownInput extends Common {
  totalRounds: number;
  layout: LayoutId;
  tagline?: string;
  /** when the calendar on screen couldn't be refreshed: when it was last loaded */
  staleSince?: Date | null;
}

/** null when there is nothing to count down to (the race is over). */
export function buildCountdownCard(i: CountdownInput): CardModel | null {
  const { weekend, now, timezone } = i;
  const t = now.getTime();
  const race = weekend.sessions.find(s => s.session_name === 'Race');
  const details: string[] = [];
  let hero: string;
  let heroCaption: string;
  let summary: string;

  if (!race) {
    const raceDay = new Date(weekend.meeting.date_end).getTime();
    if (raceDay <= t) return null;
    hero = formatDay(raceDay, 'UTC', false);
    heroCaption = 'race day · time TBC';
    summary = `race day is ${hero}, time TBC`;
  } else {
    const start = new Date(race.date_start).getTime();
    if (t >= sessionEndTime(race)) return null;
    if (t >= start) {
      hero = 'LIVE';
      heroCaption = 'Race · live now';
      summary = 'the race is live now';
    } else {
      const left = start - t;
      const days = Math.floor(left / DAY);
      if (i.layout === 'N8' && days >= 1) {
        hero = String(days);
        heroCaption = `${days === 1 ? 'day' : 'days'} to lights out`;
      } else {
        hero = formatLeft(left);
        heroCaption = 'to lights out';
      }
      summary = days >= 1 ? `${days} ${days === 1 ? 'day' : 'days'} to lights out` : `${formatLeft(left)} to lights out`;
      const live = weekend.sessions.find(s => {
        const from = new Date(s.date_start).getTime();
        return from <= t && t < sessionEndTime(s);
      });
      if (live) details.push(`${getSessionDisplayName(live)} · live now`);
    }
    details.push(formatMoment(start, timezone));
    if (weekend.provisional) details.push('Time to be confirmed closer to the date');
  }
  if (i.staleSince) details.push(`Calendar as of ${formatMoment(i.staleSince.getTime(), timezone, false)}`);

  const round = i.totalRounds ? `ROUND ${weekend.round} / ${i.totalRounds}` : `ROUND ${weekend.round}`;
  return {
    type: 'countdown', season: i.season, round: weekend.round,
    kicker: weekend.meeting.location ? `${round} · ${weekend.meeting.location.toUpperCase()}` : round,
    title: weekend.meeting.meeting_name,
    tagline: i.tagline || undefined,
    hero, heroCaption, details,
    stamp: `As of ${formatMoment(t, timezone, false)}`,
    wordmark: WORDMARK, url: cardHost(i.siteUrl), summary,
  };
}

function lapMs(lap: string | undefined): number | null {
  const m = lap?.match(/^(?:(\d+):)?(\d+)\.(\d{3})$/);
  return m ? Number(m[1] ?? 0) * 60_000 + Number(m[2]) * 1000 + Number(m[3]) : null;
}

function ordinal(n: number): string {
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

export interface QualifyingInput extends Omit<Common, 'now' | 'timezone'> {
  rows: QualifyingRow[];
  /** null when the season list didn't load */
  seasonList: SeasonFastest[] | null;
}

/** null when qualifying isn't published, or P1 set no time. Never re-ranks drivers. */
export function buildQualifyingCard(i: QualifyingInput): CardModel | null {
  const p1 = i.rows.find(r => r.position === 1);
  const key = p1 && (['q3', 'q2', 'q1'] as const).find(k => p1[k]);
  if (!p1 || !key) return null;
  const lap = p1[key]!;
  const session = key.toUpperCase();
  const details: string[] = [];

  const p2 = i.rows.find(r => r.position === 2);
  const a = lapMs(lap);
  const b = lapMs(p2?.[key]);
  if (p2 && a !== null && b !== null && b >= a) {
    details.push(`+${((b - a) / 1000).toFixed(3)}s to ${p2.lastName}`);
  }

  // Counted up to this round, and only if the list really includes this round's result
  const upTo = i.seasonList?.filter(x => x.round <= i.weekend.round) ?? [];
  if (upTo.some(x => x.round === i.weekend.round && x.driverId === p1.driverId)) {
    const n = upTo.filter(x => x.driverId === p1.driverId).length;
    details.push(`${ordinal(n)} time fastest in qualifying in ${i.season}`);
  }

  const name = `${p1.firstName} ${p1.lastName}`;
  return {
    type: 'qualifying', season: i.season, round: i.weekend.round,
    kicker: `FASTEST IN QUALIFYING · ROUND ${i.weekend.round}`,
    title: i.weekend.meeting.meeting_name,
    subject: { name, team: p1.team },
    hero: lap, heroCaption: `Best lap · ${session}`, details,
    wordmark: WORDMARK, url: cardHost(i.siteUrl),
    summary: `${name} (${p1.team}), ${lap}`,
  };
}

export interface PlaylistInput {
  week: Week;
  /** Jolpica's race name; null for off weeks */
  raceName: string | null;
  season: number;
  baseUrl: string;
  tagline?: string;
  siteUrl?: string;
}

/** Never any track names. */
export function buildPlaylistCard(i: PlaylistInput): CardModel | null {
  const p = i.week.playlist;
  if (!p) return null;
  const round = i.week.kind === 'race' ? i.week.round ?? null : null;
  const count = p.tracks.length;
  const tracks = count > 0 ? `${count} ${count === 1 ? 'track' : 'tracks'}` : '';
  const services = SERVICES.filter(s => p.links?.[s]).map(s => SERVICE_NAMES[s]).join(' · ');
  const cover = p.cover ? `${i.baseUrl}${p.cover}` : undefined;
  return {
    type: 'playlist', season: i.week.season ?? i.season, round,
    kicker: round ? `RACE-WEEK PLAYLIST · ROUND ${round}` : 'OFF-WEEK PLAYLIST',
    title: i.raceName ?? p.title,
    tagline: i.tagline || undefined,
    hero: 'Out now',
    heroCaption: cover ? ['Out now', tracks].filter(Boolean).join(' · ') : tracks,
    details: services ? [services] : [],
    cover, wordmark: WORDMARK, url: cardHost(i.siteUrl),
    summary: i.raceName ? `The ${i.raceName} race-week playlist is out` : `The playlist "${p.title}" is out`,
  };
}

/** e.g. "qualifying-2026-r22"; also the campaign name in links */
export const cardSlug = (m: Pick<CardModel, 'type' | 'season' | 'round'>) =>
  `${m.type}-${m.season}-${m.round ? `r${m.round}` : 'offweek'}`;

export const cardFileName = (m: CardModel, format: Format) => `gpcountdown-${cardSlug(m)}-${format}.png`;

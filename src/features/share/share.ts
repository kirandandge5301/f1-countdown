/** Captions, links and what this browser can do. */
import { cardSlug, type CardModel } from './cardModel';

export type Source = 'x' | 'facebook' | 'whatsapp' | 'share' | 'copy';

const LIMIT = 280;
const LINK_LENGTH = 23; // X counts every link as 23 characters

/** "Qatar Grand Prix" → "#QatarGP", accents removed */
export function raceHashtag(raceName: string): string {
  const plain = raceName.normalize('NFD').replace(/\p{M}/gu, '').replace('Grand Prix', 'GP');
  return `#${plain.replace(/[^A-Za-z0-9]/g, '')}`;
}

/** Without the link; leaves room for it. The tagline is dropped before anything is cut. */
export function caption(model: CardModel, hashtag?: string): string {
  const raceTag = hashtag ?? (model.round ? raceHashtag(model.title) : '');
  const tags = raceTag && raceTag.length <= 60 ? `#F1 ${raceTag}` : '#F1';
  const main = {
    countdown: `${model.title}: ${model.summary}.`,
    qualifying: `Fastest in qualifying at the ${model.title}: ${model.summary}.`,
    playlist: `${model.summary}.`,
  }[model.type];
  const room = LIMIT - LINK_LENGTH - 1;
  const join = (...p: Array<string | undefined>) => p.filter(Boolean).join(' ');
  const full = join(main, model.tagline, tags);
  if (full.length <= room) return full;
  const short = join(main, tags);
  return short.length <= room ? short : join(`${main.slice(0, room - tags.length - 2)}…`, tags);
}

export function siteUrl(): string {
  return ((import.meta.env.VITE_SITE_URL as string | undefined) || window.location.origin).replace(/\/+$/, '');
}

export function shareLink(base: string, model: CardModel, source: Source): string {
  const query = new URLSearchParams({ utm_source: source, utm_medium: 'social', utm_campaign: cardSlug(model) });
  return `${base}/?${query}${model.type === 'playlist' ? '#playlist' : ''}`;
}

export const xUrl = (text: string, link: string) =>
  `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`;
export const facebookUrl = (link: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
export const whatsappUrl = (text: string, link: string) => `https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`;

/** Desktop Chrome can also "share files", so a touch screen as the main input is needed too. */
export function canShareImage(file: File): boolean {
  try {
    return window.matchMedia('(pointer: coarse)').matches && !!navigator.canShare?.({ files: [file] });
  } catch {
    return false;
  }
}

export const canCopyImage = () => typeof ClipboardItem !== 'undefined' && !!navigator.clipboard?.write;
export const canCopyText = () => !!navigator.clipboard?.writeText;

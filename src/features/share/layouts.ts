/** The three card designs as data. */
import type { LayoutId } from '@/features/playlist/content';
import type { CardType, Format } from './cardModel';

export type BandColor = 'white' | 'grey' | 'black';
export type Slot = 'kicker' | 'title' | 'tagline' | 'subject' | 'hero' | 'caption' | 'details' | 'stamp' | 'wordmark';

export interface Band {
  color: BandColor;
  /** share of the card's height */
  ratio: Record<Format, number>;
  /** overrides for one card type */
  ratioFor?: Partial<Record<CardType, Record<Format, number>>>;
  top: Slot[];
  bottom: Slot[];
}

export interface Layout {
  name: string;
  heroMax: number;
  bands: Band[];
}

// Instagram's own buttons cover the top and bottom of a Story, so text keeps clear of them.
export const FORMATS: Record<Format, { w: number; h: number; safe: { x0: number; y0: number; x1: number; y1: number } }> = {
  story: { w: 1080, h: 1920, safe: { x0: 80, y0: 250, x1: 1000, y1: 1670 } },
  post: { w: 1080, h: 1350, safe: { x0: 80, y0: 80, x1: 1000, y1: 1270 } },
};

export const BAND_FILL: Record<BandColor, string> = { white: '#FFFFFF', grey: '#808080', black: '#0A0A0A' };

// Contrast: grey bands take white text only. Small grey text on white is #767676 (4.5:1)
// because #808080 is 3.95:1 there. The red title is never placed on grey.
export const INK: Record<BandColor, { kicker: string; title: string; tagline: string; body: string; muted: string }> = {
  white: { kicker: '#767676', title: '#E10600', tagline: '#111111', body: '#111111', muted: '#767676' },
  grey: { kicker: '#FFFFFF', title: '#FFFFFF', tagline: '#FFFFFF', body: '#FFFFFF', muted: '#FFFFFF' },
  black: { kicker: '#808080', title: '#E10600', tagline: '#CFCFCF', body: '#FFFFFF', muted: '#808080' },
};

export const LAYOUTS: Record<LayoutId, Layout> = {
  N8: {
    name: 'Big number',
    heroMax: 640,
    bands: [
      {
        color: 'white',
        ratio: { story: 0.38, post: 0.36 },
        ratioFor: { qualifying: { story: 0.4, post: 0.4 } },
        top: ['kicker', 'title'], bottom: ['tagline', 'subject'],
      },
      { color: 'grey', ratio: { story: 0.62, post: 0.64 }, top: ['hero', 'caption'], bottom: ['details', 'stamp', 'wordmark'] },
    ],
  },
  N7: {
    name: 'Night',
    heroMax: 300,
    bands: [
      {
        color: 'black', ratio: { story: 0.5, post: 0.48 },
        ratioFor: { playlist: { story: 0.42, post: 0.38 } },
        top: ['kicker', 'title'], bottom: ['tagline', 'subject'],
      },
      { color: 'grey', ratio: { story: 0.5, post: 0.52 }, top: ['hero', 'caption'], bottom: ['details', 'stamp', 'wordmark'] },
    ],
  },
  N3: {
    name: 'Thirds',
    heroMax: 300,
    bands: [
      {
        color: 'white', ratio: { story: 0.35, post: 0.335 },
        ratioFor: { playlist: { story: 0.28, post: 0.25 }, qualifying: { story: 0.39, post: 0.4 } },
        top: ['kicker', 'title'], bottom: ['subject'],
      },
      {
        color: 'grey', ratio: { story: 0.32, post: 0.315 },
        ratioFor: { playlist: { story: 0.42, post: 0.46 }, qualifying: { story: 0.29, post: 0.29 } },
        top: ['hero', 'caption'], bottom: [],
      },
      { color: 'black', ratio: { story: 0.33, post: 0.35 }, top: ['tagline'], bottom: ['details', 'stamp', 'wordmark'] },
    ],
  },
};

/** Band edges in pixels, top to bottom. The last band always reaches the bottom edge. */
export function bandEdges(layout: Layout, format: Format, type: CardType): Array<{ band: Band; y0: number; y1: number }> {
  const { h } = FORMATS[format];
  let y = 0;
  return layout.bands.map((band, i) => {
    const y0 = y;
    const ratio = (band.ratioFor?.[type] ?? band.ratio)[format];
    y = i === layout.bands.length - 1 ? h : Math.round(y0 + ratio * h);
    return { band, y0, y1: y };
  });
}

export interface TextStyle {
  size: number;
  min: number;
  weight: number;
  maxLines: number;
  lineHeight: number;
  serif?: boolean;
  spacing?: number;
}

export const STYLES: Record<Exclude<Slot, 'hero' | 'subject'> | 'subjectName' | 'subjectTeam', TextStyle> = {
  kicker: { size: 38, min: 30, weight: 500, maxLines: 2, lineHeight: 1.25, spacing: 3 },
  title: { size: 116, min: 56, weight: 800, maxLines: 3, lineHeight: 1.0 },
  tagline: { size: 68, min: 46, weight: 400, maxLines: 2, lineHeight: 1.1, serif: true },
  subjectName: { size: 68, min: 44, weight: 800, maxLines: 2, lineHeight: 1.08 },
  subjectTeam: { size: 46, min: 40, weight: 500, maxLines: 1, lineHeight: 1.2 },
  caption: { size: 64, min: 44, weight: 500, maxLines: 2, lineHeight: 1.15 },
  details: { size: 46, min: 40, weight: 500, maxLines: 2, lineHeight: 1.22 },
  stamp: { size: 40, min: 40, weight: 500, maxLines: 2, lineHeight: 1.2 },
  wordmark: { size: 44, min: 40, weight: 800, maxLines: 1, lineHeight: 1.2, spacing: 6 },
};

/** Draws a CardModel on a canvas. Text wraps, then shrinks, then (last resort) gets an ellipsis. */
import type { LayoutId } from '@/features/playlist/content';
import type { CardModel, Format } from './cardModel';
import { loadCardFonts, SANS, SERIF } from './fonts';
import { BAND_FILL, bandEdges, FORMATS, INK, LAYOUTS, STYLES, type BandColor, type Slot, type TextStyle } from './layouts';

const PAD = 48;          // space between text and a band's edge
const GAP = 20;          // space between two slots
const GREY_MIN = 40;     // smallest text allowed on grey

export type Measure = (text: string, size: number) => number;
export interface Fitted { lines: string[]; size: number }

function wrap(measure: Measure, text: string, width: number, size: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/ +/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, size) > width) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  return line ? [...lines, line] : lines;
}

/** Pure (the measuring function is passed in), so it can be tested without a browser. */
export function fitText(measure: Measure, text: string, width: number, start: number, min: number, maxLines: number): Fitted {
  const fits = (lines: string[], size: number) =>
    lines.length <= maxLines && lines.every(l => measure(l, size) <= width);
  for (let size = Math.max(start, min); size > min; size -= 2) {
    const lines = wrap(measure, text, width, size);
    if (fits(lines, size)) return { lines, size };
  }
  const lines = wrap(measure, text, width, min);
  if (fits(lines, min)) return { lines, size: min };

  const kept = lines.slice(0, maxLines);
  return {
    size: min,
    lines: kept.map((l, i) => {
      const cut = i === kept.length - 1 && lines.length > maxLines;
      let out = cut ? `${l}…` : l;
      while (measure(out, min) > width && out.length > 1) out = `${out.replace(/…$/, '').slice(0, -1).trimEnd()}…`;
      return out;
    }),
  };
}

interface Block {
  height: number;
  draw: (y: number) => void;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`cover not found: ${src}`));
    img.src = src;
  });
}

async function loadCover(src: string): Promise<CanvasImageSource & { width: number; height: number } | null> {
  // Same-origin only: anything else would make the canvas impossible to export
  if (new URL(src, window.location.href).origin !== window.location.origin) return null;
  try {
    return await loadImage(src);
  } catch (err) {
    console.warn(err);
    return null;
  }
}

export interface RenderOptions {
  layout: LayoutId;
  format: Format;
  watermark?: string;
}

export async function renderCard(model: CardModel, options: RenderOptions): Promise<HTMLCanvasElement> {
  await loadCardFonts();
  const cover = model.cover ? await loadCover(model.cover) : null;

  const layout = LAYOUTS[options.layout];
  const { w, h, safe } = FORMATS[options.format];
  const width = safe.x1 - safe.x0;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available');
  ctx.textBaseline = 'alphabetic';

  const setFont = (size: number, weight: number, serif = false, spacing = 0) => {
    ctx.font = serif ? `italic 400 ${size}px ${SERIF}` : `${weight} ${size}px ${SANS}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing}px`;
  };

  const textBlock = (text: string, style: TextStyle, color: string, band: BandColor, scale: number): Block => {
    const min = band === 'grey' ? Math.max(style.min, GREY_MIN) : style.min;
    const measure: Measure = (t, size) => {
      setFont(size, style.weight, style.serif, style.spacing);
      return ctx.measureText(t).width;
    };
    const fit = fitText(measure, text, width, Math.round(style.size * scale), min, style.maxLines);
    const step = fit.size * style.lineHeight;
    return {
      height: step * fit.lines.length,
      draw: y => {
        setFont(fit.size, style.weight, style.serif, style.spacing);
        ctx.fillStyle = color;
        fit.lines.forEach((line, i) => ctx.fillText(line, safe.x0, y + step * i + fit.size * 0.8));
      },
    };
  };

  const slotBlocks = (slot: Slot, band: BandColor, scale: number): Block[] => {
    const ink = INK[band];
    switch (slot) {
      case 'kicker': return [textBlock(model.kicker, STYLES.kicker, ink.kicker, band, scale)];
      case 'title': return [textBlock(model.title.replace('Grand Prix', 'Grand\u00a0Prix'), STYLES.title, ink.title, band, scale)];
      case 'tagline': return model.tagline ? [textBlock(model.tagline, STYLES.tagline, ink.tagline, band, scale)] : [];
      case 'subject': return model.subject
        ? [
            textBlock(model.subject.name, STYLES.subjectName, ink.body, band, scale),
            textBlock(model.subject.team, STYLES.subjectTeam, ink.body, band, scale),
          ]
        : [];
      case 'caption': return model.heroCaption ? [textBlock(model.heroCaption, STYLES.caption, ink.body, band, scale)] : [];
      case 'details': return model.details.map(d => textBlock(d, STYLES.details, ink.body, band, scale));
      case 'stamp': return model.stamp ? [textBlock(model.stamp, STYLES.stamp, ink.muted, band, scale)] : [];
      case 'wordmark': {
        const mark = textBlock(model.wordmark, STYLES.wordmark, ink.body, band, scale);
        return model.url ? [mark, textBlock(model.url, STYLES.stamp, ink.muted, band, scale)] : [mark];
      }
      case 'hero': return []; // drawn separately: it takes whatever height is left
    }
  };

  const stackHeight = (blocks: Block[]) => blocks.reduce((sum, b) => sum + b.height, 0) + GAP * Math.max(0, blocks.length - 1);

  for (const { band, y0, y1 } of bandEdges(layout, options.format, model.type)) {
    ctx.fillStyle = BAND_FILL[band.color];
    ctx.fillRect(0, y0, w, y1 - y0);

    const top = Math.max(y0 + PAD, safe.y0);
    const bottom = Math.min(y1 - PAD, safe.y1);
    const hasHero = band.top.includes('hero');
    const heroMin = hasHero ? (cover ? 240 : 110) : 0;

    // Shrink everything in the band together until it fits
    let above: Block[] = [];
    let below: Block[] = [];
    for (let scale = 1; scale >= 0.5; scale -= 0.04) {
      above = band.top.flatMap(s => slotBlocks(s, band.color, scale));
      below = band.bottom.flatMap(s => slotBlocks(s, band.color, scale));
      const groups = [above, below].filter(g => g.length > 0);
      const gaps = groups.length === 2 ? GAP * 2 : 0;
      const need = stackHeight(above) + stackHeight(below) + gaps + (hasHero ? heroMin + GAP * 1.5 : 0);
      if (need <= bottom - top) break;
    }

    let y = top;
    if (hasHero) {
      const reserved = stackHeight(above) + (above.length ? GAP * 1.5 : 0) + (below.length ? stackHeight(below) + GAP * 2 : 0);
      const room = bottom - top - reserved;
      if (cover) {
        const side = Math.min(room, width);
        const crop = Math.min(cover.width, cover.height);
        ctx.drawImage(cover, (cover.width - crop) / 2, (cover.height - crop) / 2, crop, crop, safe.x0, y, side, side);
        y += side;
      } else {
        const measure: Measure = (t, size) => {
          setFont(size, 300, false, -size * 0.03);
          return ctx.measureText(t).width;
        };
        const fit = fitText(measure, model.hero, width, Math.min(layout.heroMax, Math.floor(room / 0.76)), 72, 1);
        const height = fit.size * 0.76;
        // A hero alone with its caption is centred in its band
        if (below.length === 0) y += Math.max(0, (room - height) / 2);
        setFont(fit.size, 300, false, -fit.size * 0.03);
        ctx.fillStyle = INK[band.color].body;
        ctx.fillText(fit.lines[0], safe.x0 - fit.size * 0.04, y + fit.size * 0.74);
        y += height;
      }
      y += GAP * 1.5;
    }
    for (const b of above) {
      b.draw(y);
      y += b.height + GAP;
    }
    let up = bottom - stackHeight(below);
    for (const b of below) {
      b.draw(up);
      up += b.height + GAP;
    }
  }

  if (options.watermark) {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(-Math.PI / 5);
    setFont(104, 800);
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 3;
    for (const dy of [-520, 0, 520]) {
      ctx.fillText(options.watermark, 0, dy);
      ctx.strokeText(options.watermark, 0, dy);
    }
    ctx.restore();
  }
  return canvas;
}

export async function renderPng(model: CardModel, options: RenderOptions): Promise<Blob> {
  const canvas = await renderCard(model, options);
  return new Promise((resolve, reject) =>
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('The image could not be created'))), 'image/png')
  );
}

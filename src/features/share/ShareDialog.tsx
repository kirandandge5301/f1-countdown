/** Preview and share a card. Loaded on first open. */
import { useEffect, useMemo, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { useData } from '@/context/DataContext';
import { useTimezone } from '@/context/TimezoneContext';
import { weekForRace, type LayoutId, type Week } from '@/features/playlist/content';
import { getPlaylistState, raceNameFor } from '@/features/playlist/playlistState';
import { useCalendarInfo } from '@/features/playlist/useSiteNow';
import { buildCountdownCard, buildPlaylistCard, buildQualifyingCard, cardFileName, type CardModel, type CardType, type Format } from './cardModel';
import { renderPng } from './render';
import { canCopyImage, canCopyText, canShareImage, caption, facebookUrl, shareLink, siteUrl, whatsappUrl, xUrl } from './share';
import type { QualifyingResult } from './useQualifying';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialType: CardType;
  qualifying: QualifyingResult | null;
}

const TYPE_NAMES: Record<CardType, string> = { countdown: 'Countdown', qualifying: 'Qualifying', playlist: 'Playlist' };
const BUTTON =
  'min-h-11 px-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-sm font-medium text-[var(--text-primary)] flex items-center justify-center text-center disabled:opacity-50';
const PRIMARY = 'min-h-11 px-4 rounded-2xl bg-[#E10600] text-white text-sm font-semibold disabled:opacity-50';
const HELP = 'text-xs text-[var(--text-secondary)]';

interface Offer {
  model: CardModel;
  layout: LayoutId;
  hashtag?: string;
}

interface Picture {
  offer: Offer;
  format: Format;
  file: File;
  url: string;
}

export default function ShareDialog({ open, onOpenChange, initialType, qualifying }: Props) {
  const { nextRace, activeSeason, totalRounds, content, calendarStaleSince } = useData();
  const { timezone } = useTimezone();
  const cal = useCalendarInfo();
  const [type, setType] = useState<CardType>(initialType);
  const [format, setFormat] = useState<Format>(() => (window.matchMedia('(pointer: coarse)').matches ? 'story' : 'post'));
  // The card is a snapshot of this moment; its stamp says so
  const [now, setNow] = useState(() => new Date());
  const [picture, setPicture] = useState<Picture | null>(null);
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState('');

  const offers = useMemo(() => {
    const site = import.meta.env.VITE_SITE_URL as string | undefined;
    const list: Partial<Record<CardType, Offer>> = {};
    const add = (model: CardModel | null, week: Week | null) => {
      if (model) list[model.type] = { model, layout: week?.layout ?? 'N8', hashtag: week?.hashtag };
    };
    if (nextRace) {
      const week = weekForRace(content, activeSeason, nextRace.race.round);
      add(buildCountdownCard({
        weekend: nextRace.race, season: activeSeason, now, timezone, totalRounds,
        layout: week?.layout ?? 'N8', tagline: week?.tagline, staleSince: calendarStaleSince, siteUrl: site,
      }), week);
    }
    if (qualifying) {
      add(buildQualifyingCard({ ...qualifying, siteUrl: site }), weekForRace(content, qualifying.season, qualifying.weekend.round));
    }
    if (content) {
      const state = getPlaylistState(content, cal, now);
      if (state.kind === 'dropped') {
        add(buildPlaylistCard({
          week: state.week, raceName: raceNameFor(state.week, cal), season: activeSeason,
          baseUrl: import.meta.env.BASE_URL, tagline: state.week.tagline, siteUrl: site,
        }), state.week);
      }
    }
    return list;
  }, [nextRace, activeSeason, totalRounds, content, calendarStaleSince, timezone, cal, now, qualifying]);

  const types = (Object.keys(TYPE_NAMES) as CardType[]).filter(t => offers[t]);
  const shown = offers[type] ? type : types[0];
  const offer = shown ? offers[shown] : undefined;

  // Draw ahead of time: sharing and copying are only allowed directly inside a click
  useEffect(() => {
    if (!open || !offer) return;
    let current = true;
    let url = '';
    renderPng(offer.model, { layout: offer.layout, format })
      .then(blob => {
        if (!current) return;
        const file = new File([blob], cardFileName(offer.model, format), { type: 'image/png' });
        url = URL.createObjectURL(file);
        setPicture({ offer, format, file, url });
        setFailed(false);
      })
      .catch(err => {
        console.error('Share card could not be drawn', err);
        if (current) setFailed(true);
      });
    return () => {
      current = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, offer, format]);

  const ready = picture && picture.offer === offer && picture.format === format ? picture : null;
  const base = siteUrl();
  const text = offer ? caption(offer.model, offer.hashtag) : '';
  const link = (source: Parameters<typeof shareLink>[2]) => (offer ? shareLink(base, offer.model, source) : base);
  const phone = ready ? canShareImage(ready.file) : window.matchMedia('(pointer: coarse)').matches;

  const refresh = () => {
    setNow(new Date());
    setMessage('');
  };

  const shareImage = async () => {
    if (!ready) return;
    try {
      await navigator.share({ files: [ready.file], text: `${text} ${link('share')}` });
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') setMessage("Sharing didn't work here. Use Download instead.");
    }
  };

  const copyImage = async () => {
    if (!ready) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': Promise.resolve<Blob>(ready.file) })]);
      setMessage('Image copied. Paste it into your post (Ctrl+V / ⌘V).');
    } catch {
      setMessage("The image couldn't be copied. Use Download instead.");
    }
  };

  const copyText = async (value: string, done: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(done);
    } catch {
      setMessage("Copying didn't work in this browser.");
    }
  };

  const toggle = (on: boolean) =>
    `min-h-11 px-4 rounded-2xl text-sm font-medium border ${on
      ? 'bg-[var(--active-card-bg)] text-[var(--active-card-text)] border-transparent'
      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)]'}`;

  const download = ready
    ? <a className={BUTTON} href={ready.url} download={ready.file.name}>Download</a>
    : <button className={BUTTON} disabled>Download</button>;
  const copyCaption = canCopyText() && offer && (
    <button className={BUTTON} onClick={() => copyText(`${text} ${link('copy')}`, 'Caption copied.')}>Copy caption</button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="z-[190] bg-black/70" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-[200] w-[calc(100%-24px)] max-w-3xl max-h-[calc(100dvh-24px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] p-5 md:p-7 outline-none"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <DialogTitle className="text-xl font-semibold">Share</DialogTitle>
              <DialogDescription className="text-sm text-[var(--text-secondary)] mt-1">A picture of this moment, ready to post.</DialogDescription>
            </div>
            <DialogPrimitive.Close aria-label="Close" className="min-w-11 min-h-11 -mt-2 -mr-2 flex items-center justify-center text-[var(--text-secondary)]">
              <X size={22} />
            </DialogPrimitive.Close>
          </div>

          {!offer ? (
            <p className="text-sm text-[var(--text-secondary)] py-8">There is nothing to share right now.</p>
          ) : (
            <div className="grid md:grid-cols-[minmax(0,260px)_1fr] gap-6">
              <div className="mx-auto w-full max-w-[200px] md:max-w-none">
                <div className={`rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] ${format === 'story' ? 'aspect-[9/16]' : 'aspect-[4/5]'}`}>
                  {ready && (
                    <img src={ready.url} className="w-full h-full" alt={`Share card: ${offer.model.title}, ${offer.model.summary}`} />
                  )}
                </div>
              </div>

              <div className="space-y-4 min-w-0">
                {types.length > 1 && (
                  <div role="group" aria-label="Card" className="flex flex-wrap gap-2">
                    {types.map(t => (
                      <button key={t} aria-pressed={t === shown} className={toggle(t === shown)} onClick={() => { setType(t); refresh(); }}>
                        {TYPE_NAMES[t]}
                      </button>
                    ))}
                  </div>
                )}
                <div role="group" aria-label="Format" className="flex gap-2">
                  {(['story', 'post'] as Format[]).map(f => (
                    <button key={f} aria-pressed={f === format} className={toggle(f === format)} onClick={() => { setFormat(f); refresh(); }}>
                      {f === 'story' ? 'Story' : 'Post'}
                    </button>
                  ))}
                </div>

                {failed && <p className="text-sm text-[var(--text-secondary)]">The picture couldn't be made. Close this and try again.</p>}

                {phone ? (
                  <div className="space-y-3">
                    <button className={`${PRIMARY} w-full`} disabled={!ready} onClick={shareImage}>Share image</button>
                    <div className="grid grid-cols-2 gap-2">{copyCaption}{download}</div>
                    <p className={HELP}>Some apps drop the text when you share a picture. Copy the caption to paste it.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {canCopyImage() && <button className={`${PRIMARY} w-full`} disabled={!ready} onClick={copyImage}>Copy image</button>}
                    <div className="grid grid-cols-2 gap-2">
                      <a className={BUTTON} target="_blank" rel="noopener noreferrer" href={xUrl(text, link('x'))}>Post on X</a>
                      <a className={BUTTON} target="_blank" rel="noopener noreferrer" href={facebookUrl(link('facebook'))}>Facebook</a>
                      <a className={BUTTON} target="_blank" rel="noopener noreferrer" href={whatsappUrl(text, link('whatsapp'))}>WhatsApp</a>
                      {download}
                      {copyCaption}
                      {canCopyText() && <button className={BUTTON} onClick={() => copyText(link('copy'), 'Link copied.')}>Copy link</button>}
                    </div>
                    <p className={HELP}>X: copy the image first, then paste it into the post.</p>
                    <p className={HELP}>Facebook doesn't allow pre-filled text. Copy the caption to paste it.</p>
                  </div>
                )}
                <p role="status" aria-live="polite" className="text-sm min-h-5">{message}</p>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

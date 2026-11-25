/** Card Studio (/?studio): previews only. Every card is watermarked; nothing can be downloaded or shared. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useData } from '@/context/DataContext';
import { useTimezone } from '@/context/TimezoneContext';
import { fetchQualifying, fetchSeasonPoles, type QualifyingRow, type SeasonFastest } from '@/services/qualifying';
import type { LayoutId, Week } from '@/features/playlist/content';
import { raceMoment } from '@/features/playlist/playlistState';
import { NowContext } from '@/features/playlist/time';
import { buildCountdownCard, buildPlaylistCard, buildQualifyingCard, type CardModel, type CardType, type Format } from './cardModel';
import { renderCard } from './render';
import { defaultEntry } from './defaultEntry';

const FIELD = 'w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)]';
const LAYOUT_OPTIONS: Array<[LayoutId, string]> = [['N8', 'N8 Big number'], ['N7', 'N7 Night'], ['N3', 'N3 Thirds']];

function CardPreview({ model, layout, format }: { model: CardModel; layout: LayoutId; format: Format }) {
  const holder = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let current = true;
    renderCard(model, { layout, format, watermark: 'STUDIO PREVIEW' })
      .then(canvas => {
        if (!current) return;
        canvas.style.width = '100%';
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', `Studio preview: ${model.title}, ${model.summary}`);
        holder.current?.replaceChildren(canvas);
      })
      .catch(err => console.error(err));
    return () => { current = false; };
  }, [model, layout, format]);
  return <div ref={holder} className="w-full max-w-[389px] rounded-2xl overflow-hidden border border-[var(--border-subtle)]" />;
}

export default function Studio() {
  const { raceWeekends, activeSeason, totalRounds, content, calendarError } = useData();
  const { timezone } = useTimezone();
  const [opened] = useState(() => new Date());
  const [weekId, setWeekId] = useState('');
  const [type, setType] = useState<CardType>('countdown');
  const [layoutChoice, setLayout] = useState<LayoutId | ''>('');
  const [format, setFormat] = useState<Format>('story');
  const [taglineChoice, setTagline] = useState<string | null>(null);
  const [nowText, setNowText] = useState('');
  const [copied, setCopied] = useState('');
  const [quali, setQuali] = useState<{ round: number; rows: QualifyingRow[] | null; list: SeasonFastest[] | null } | null>(null);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex';
    document.head.append(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (new URLSearchParams(window.location.search).get('export') !== 'samples') return;
    void import('./samples').then(m => m.exportSamples(line => setLog(l => [...l, line])));
  }, []);

  const typedNow = nowText ? new Date(nowText) : null;
  const now = typedNow && Number.isFinite(typedNow.getTime()) ? typedNow : opened;

  const weeks = useMemo<Week[]>(() => {
    const entries = content?.weeks ?? [];
    const upcoming = raceWeekends
      .filter(w => raceMoment(w).end > opened.getTime() && !entries.some(e => e.season === activeSeason && e.round === w.round))
      .map(w => defaultEntry(w, activeSeason));
    return [...entries, ...upcoming];
  }, [content, raceWeekends, activeSeason, opened]);

  const week = weeks.find(w => w.id === weekId) ?? weeks[0];
  const weekend = week?.season === activeSeason ? raceWeekends.find(w => w.round === week.round) : undefined;
  const layout: LayoutId = layoutChoice || week?.layout || 'N8';
  const tagline = taglineChoice ?? week?.tagline ?? '';
  const isSaved = !!content?.weeks.some(w => w.id === week?.id);

  useEffect(() => {
    if (type !== 'qualifying' || !weekend) return;
    let current = true;
    void Promise.all([fetchQualifying(activeSeason, weekend.round), fetchSeasonPoles(activeSeason)])
      .then(([rows, list]) => { if (current) setQuali({ round: weekend.round, rows, list }); });
    return () => { current = false; };
  }, [type, weekend, activeSeason]);

  const nowMs = now.getTime();
  const { model, problem } = useMemo((): { model: CardModel | null; problem: string } => {
    const siteUrl = import.meta.env.VITE_SITE_URL as string | undefined;
    if (!week) return { model: null, problem: calendarError ?? 'Loading the calendar…' };
    if (type === 'playlist') {
      return {
        model: buildPlaylistCard({ week, raceName: weekend?.meeting.meeting_name ?? null, season: activeSeason, baseUrl: import.meta.env.BASE_URL, tagline, siteUrl }),
        problem: 'This entry has no playlist.',
      };
    }
    if (!weekend) return { model: null, problem: 'This week has no race in the current calendar.' };
    if (type === 'countdown') {
      return {
        model: buildCountdownCard({ weekend, season: activeSeason, now: new Date(nowMs), timezone, totalRounds, layout, tagline, siteUrl }),
        problem: 'The race is over at this "now".',
      };
    }
    if (quali?.round !== weekend.round) return { model: null, problem: 'Loading qualifying…' };
    return {
      model: quali.rows && buildQualifyingCard({ weekend, season: activeSeason, rows: quali.rows, seasonList: quali.list, siteUrl }),
      problem: quali.rows ? 'Qualifying is not published yet for this round.' : "Qualifying couldn't be loaded.",
    };
  }, [week, weekend, type, nowMs, timezone, totalRounds, layout, tagline, activeSeason, quali, calendarError]);

  const copy = async () => {
    if (!week) return;
    const entry: Week = { ...week, layout, tagline: tagline || undefined };
    try {
      await navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
      setCopied('Copied.');
    } catch {
      setCopied('Copying was blocked by the browser.');
    }
  };

  return (
    <NowContext.Provider value={now}>
      <div className="max-w-6xl mx-auto px-5 py-10">
        <h1 className="text-3xl font-semibold mb-2">Card Studio</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">Previews only. Nothing here is published.</p>
        {log.length > 0 && <pre id="sample-log" className="text-xs mb-8 whitespace-pre-wrap">{log.join('\n')}</pre>}

        <div className="grid md:grid-cols-[320px_1fr] gap-10">
          <div className="space-y-4">
            <label className="block text-xs text-[var(--text-secondary)]">Week
              <select className={FIELD} value={week?.id ?? ''} onChange={e => { setWeekId(e.target.value); setTagline(null); setLayout(''); setCopied(''); }}>
                {weeks.map(w => <option key={w.id} value={w.id}>{w.id}{content?.weeks.includes(w) ? '' : ' (no entry yet)'}</option>)}
              </select>
            </label>
            <label className="block text-xs text-[var(--text-secondary)]">Card
              <select className={FIELD} value={type} onChange={e => setType(e.target.value as CardType)}>
                <option value="countdown">Countdown</option>
                <option value="qualifying">Fastest in qualifying</option>
                <option value="playlist">Playlist out now</option>
              </select>
            </label>
            <label className="block text-xs text-[var(--text-secondary)]">Layout
              <select className={FIELD} value={layout} onChange={e => setLayout(e.target.value as LayoutId)}>
                {LAYOUT_OPTIONS.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
            </label>
            <label className="block text-xs text-[var(--text-secondary)]">Format
              <select className={FIELD} value={format} onChange={e => setFormat(e.target.value as Format)}>
                <option value="story">Story 1080×1920</option>
                <option value="post">Post 1080×1350</option>
              </select>
            </label>
            <label className="block text-xs text-[var(--text-secondary)]">Tagline ({tagline.length}/45)
              <input className={FIELD} value={tagline} maxLength={45} onChange={e => setTagline(e.target.value)} />
            </label>
            <label className="block text-xs text-[var(--text-secondary)]">Now (your device's time; empty = real time)
              <input type="datetime-local" className={FIELD} value={nowText} onChange={e => setNowText(e.target.value)} />
            </label>
            <button onClick={copy} disabled={!week} className="w-full min-h-11 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm">
              Copy entry JSON
            </button>
            <p className="text-xs text-[var(--text-secondary)]" role="status">
              {copied} {!isSaved && week ? 'Replace every "REPLACE ME" before publishing.' : ''}
            </p>
          </div>
          <div>
            {model
              ? <CardPreview model={model} layout={layout} format={format} />
              : <p className="text-sm text-[var(--text-secondary)]">{problem}</p>}
          </div>
        </div>
      </div>
    </NowContext.Provider>
  );
}

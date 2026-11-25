import { useContext, useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import SectionLabel from '@/components/SectionLabel';
import { useData } from '@/context/DataContext';
import { useTimezone } from '@/context/TimezoneContext';
import ShareButton from '@/features/share/ShareButton';
import { SERVICES, SERVICE_NAMES, type Playlist, type Service, type Track } from './content';
import { embedFor } from './embeds';
import { getPlaylistState, raceNameFor } from './playlistState';
import { formatLeft, formatMoment, NowContext } from './time';
import { useCalendarInfo, useSiteNow } from './useSiteNow';

const SERVICE_KEY = 'gpcountdown-music';
const CARD = 'rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 md:p-6';
const BUTTON =
  'min-h-11 px-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-sm font-medium text-[var(--text-primary)] inline-flex items-center gap-2 transition-colors';

type Links = Playlist['links'];

function savedService(): string | null {
  try {
    return localStorage.getItem(SERVICE_KEY);
  } catch {
    return null;
  }
}

function Follow({ links }: { links: Links }) {
  const available = SERVICES.filter(s => links?.[s]);
  if (available.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {available.map(s => (
        <a key={s} className={BUTTON} href={links![s]} target="_blank" rel="noopener noreferrer">
          Follow on {SERVICE_NAMES[s]}
        </a>
      ))}
    </div>
  );
}

/** Nothing is loaded from a music service until Play is tapped. */
function Player({ links, title }: { links: Links; title: string }) {
  const [saved] = useState(savedService); // read once, so the buttons don't swap places when tapped
  const [playing, setPlaying] = useState<Service | null>(null);
  const available = SERVICES.filter(s => embedFor(s, links?.[s]));
  if (available.length === 0) return null;

  const ordered = [...available].sort((a, b) => Number(b === saved) - Number(a === saved));
  const embed = playing && embedFor(playing, links?.[playing]);

  const play = (s: Service) => {
    setPlaying(s);
    try {
      localStorage.setItem(SERVICE_KEY, s);
    } catch {
      // storage can be blocked (private mode)
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {ordered.map(s => (
          <button key={s} className={BUTTON} aria-pressed={playing === s} onClick={() => play(s)}>
            <Play size={14} aria-hidden /> Play on {SERVICE_NAMES[s]}
          </button>
        ))}
      </div>
      {embed && playing && (
        <iframe
          key={embed.src}
          src={embed.src}
          title={`${title} on ${SERVICE_NAMES[playing]}`}
          height={embed.height}
          allow={embed.allow}
          className="w-full rounded-2xl border-0"
        />
      )}
    </div>
  );
}

function TrackRow({ track, number }: { track: Track; number: number }) {
  const links = SERVICES.filter(s => track.links?.[s]);
  return (
    <li className="py-3 border-b border-[var(--border-subtle)] last:border-0 flex gap-4">
      <span className="font-mono text-sm text-[var(--text-secondary)] tabular-nums pt-0.5">{String(number).padStart(2, '0')}</span>
      <div className="min-w-0">
        <p className="text-base text-[var(--text-primary)] break-words">
          {track.title} <span className="text-[var(--text-secondary)]">· {track.artist}</span>
        </p>
        {track.note && <p className="text-sm text-[var(--text-secondary)] break-words">{track.note}</p>}
        {links.length > 0 && (
          <p className="flex flex-wrap gap-x-4">
            {links.map(s => (
              <a key={s} href={track.links![s]} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                Open in {SERVICE_NAMES[s]}
              </a>
            ))}
          </p>
        )}
      </div>
    </li>
  );
}

function Cover({ playlist }: { playlist: Playlist }) {
  const [broken, setBroken] = useState(false);
  if (!playlist.cover || broken) return null;
  return (
    <img
      src={`${import.meta.env.BASE_URL}${playlist.cover}`}
      alt={`Cover of ${playlist.title}`}
      loading="lazy"
      onError={() => setBroken(true)}
      className="w-full max-w-[280px] aspect-square object-cover rounded-2xl"
    />
  );
}

export default function PlaylistSection() {
  const { content, loading } = useData();
  const { timezone } = useTimezone();
  const inStudio = useContext(NowContext) !== null;
  const now = useSiteNow();
  const cal = useCalendarInfo();
  const sectionRef = useRef<HTMLElement>(null);
  const visible = !!content && !loading;

  // Shared links end in #playlist, but the section appears only after the data has loaded
  useEffect(() => {
    if (visible && window.location.hash === '#playlist') sectionRef.current?.scrollIntoView();
  }, [visible]);

  if (!content || loading) return null;

  const state = getPlaylistState(content, cal, now);
  const playlist = 'playlist' in state ? state.playlist : null;
  const name = 'week' in state ? raceNameFor(state.week, cal) : state.kind === 'soon' ? state.raceName : null;
  const left = (at: number) => formatLeft(at - now.getTime());

  const heading = (
    <>
      <SectionLabel text={name ?? 'Playlist'} />
      <h2 className="text-[clamp(36px,5vw,56px)] font-semibold text-[var(--text-primary)] tracking-[-0.02em] leading-tight mb-4">
        Race-week playlist.
      </h2>
      {playlist && <p className="text-base text-[var(--text-secondary)] mb-10">{playlist.title}</p>}
    </>
  );

  const next = (at: number, isDrop: boolean, trackNumber: number) => (
    <p className="text-sm text-[var(--text-secondary)]">
      {isDrop ? 'Full playlist drops' : `Track ${trackNumber} drops`} in{' '}
      <span className="text-[var(--text-primary)] tabular-nums">{left(at)}</span> · {formatMoment(at, timezone)}
    </p>
  );

  return (
    <section ref={sectionRef} id="playlist" className="px-[clamp(20px,5vw,64px)] py-[clamp(60px,10vh,120px)] scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        {heading}

        {state.kind === 'soon' && (
          <p className="text-base text-[var(--text-primary)]">This week's playlist is coming soon.</p>
        )}

        {state.kind === 'upcoming' && (
          <div className="space-y-6">
            <Cover playlist={state.playlist} />
            {next(state.nextAt, state.nextIsDrop, 1)}
            <Follow links={state.playlist.links} />
          </div>
        )}

        {state.kind === 'daily' && (
          <div className={state.playlist.cover ? 'grid md:grid-cols-[280px_minmax(0,1fr)] gap-8' : 'space-y-8'}>
            {state.playlist.cover && <div><Cover playlist={state.playlist} /></div>}
            <div className="space-y-6 min-w-0">
              <div className={`${CARD} space-y-4`}>
                <p className="text-[11px] font-medium tracking-[0.2em] text-[#E10600] uppercase">
                  {state.latestIsToday ? "Today's track" : 'Latest track'} · Day {state.day} of {state.days}
                </p>
                <ol><TrackRow track={state.latest} number={state.revealed.length} /></ol>
                <Player key={state.latest.revealAt} links={state.latest.links} title={state.latest.title} />
              </div>
              {next(state.nextAt, state.nextIsDrop, state.revealed.length + 1)}
              {state.revealed.length > 1 && (
                <ol aria-label="Earlier tracks">
                  {state.revealed.slice(0, -1).map((t, i) => <TrackRow key={i} track={t} number={i + 1} />)}
                </ol>
              )}
              <Follow links={state.playlist.links} />
            </div>
          </div>
        )}

        {state.kind === 'dropped' && (
          <div className={state.playlist.cover ? 'grid md:grid-cols-[280px_minmax(0,1fr)] gap-8' : 'space-y-8'}>
            <div className="space-y-4">
              <Cover playlist={state.playlist} />
              {/* Studio never shares anything */}
              {!inStudio && <ShareButton label="Share" type="playlist" />}
            </div>
            <div className="space-y-6 min-w-0">
              <p className="text-xl font-medium text-[var(--text-primary)]">
                Out now{state.playlist.tracks.length > 0 &&
                  ` · ${state.playlist.tracks.length} ${state.playlist.tracks.length === 1 ? 'track' : 'tracks'}`}
              </p>
              <Player key={state.week.id} links={state.playlist.links} title={state.playlist.title} />
              <Follow links={state.playlist.links} />
              <ol>{state.playlist.tracks.map((t, i) => <TrackRow key={i} track={t} number={i + 1} />)}</ol>
            </div>
          </div>
        )}

        {state.kind === 'waiting' && (
          <div className="space-y-8">
            {state.message && <p className="text-lg text-[var(--text-primary)] max-w-2xl">{state.message}</p>}
            {state.next && (
              <p className="text-sm text-[var(--text-secondary)]">
                Next playlist drops {formatMoment(state.next.at, timezone)} ·{' '}
                {state.next.isRace ? `${state.next.name.replace(/ Grand Prix$/, '')} race week` : state.next.name} · in{' '}
                <span className="text-[var(--text-primary)] tabular-nums">{left(state.next.at)}</span>
              </p>
            )}
            {state.seasonOver && (
              <p className="text-sm text-[var(--text-secondary)]">Next playlist: when the {state.seasonOver} season starts.</p>
            )}
            {state.last && (
              <div className={`${CARD} space-y-4`}>
                <p className="text-[11px] font-medium tracking-[0.2em] text-[var(--text-secondary)] uppercase">Last playlist</p>
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="sm:max-w-[160px]"><Cover playlist={state.last.playlist} /></div>
                  <div className="space-y-4 min-w-0">
                    <p className="text-lg font-medium text-[var(--text-primary)]">{state.last.playlist.title}</p>
                    <Player key={state.last.week.id} links={state.last.playlist.links} title={state.last.playlist.title} />
                    <Follow links={state.last.playlist.links} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

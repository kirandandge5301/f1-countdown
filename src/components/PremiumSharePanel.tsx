import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Download, Instagram, Loader2, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCountdown } from '@/hooks/useCountdown';
import { useTheme } from '@/context/ThemeContext';
import { getSessionDisplayName, type NextRaceInfo } from '@/services/openf1';
import type { RaceWeekExperience } from '@/services/raceExperience';
import {
  downloadDataUrl,
  renderShareCard,
  type ShareCardData,
  type ShareCardFormat,
} from '@/services/shareCardRenderer';
import { trackShareEvent } from '@/services/shareAnalytics';

interface PremiumSharePanelProps {
  nextRace: NextRaceInfo;
  raceWeekExperience: RaceWeekExperience | null;
  timezone: string;
  timezoneLabel: string;
}

type ShareStatus = 'idle' | 'generating' | 'ready' | 'downloaded' | 'copied';

const INSTAGRAM_CAPTION = 'Every Second Matters.\n\nTrack every session with GPCountdown.';

function formatSessionStart(dateString: string | undefined, timezone: string): string {
  if (!dateString) return 'soon';

  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateString));
}

function getRaceWeekStatus(experience: RaceWeekExperience | null): string {
  if (!experience) return 'Race Week.';

  const statusByPhase: Record<RaceWeekExperience['phase'], string> = {
    RACE_WEEK: '\uD83C\uDFC1 Race Week.',
    PRACTICE_DAY: '\uD83D\uDD25 Cars On Track Today.',
    SPRINT_DAY: '\u26A1 Sprint Day.',
    QUALIFYING_DAY: '\u26A1 Qualifying Day.',
    RACE_DAY: '\uD83D\uDEA5 Lights Out Today.',
    WEEKEND_COMPLETE: '\uD83C\uDFC6 Race Weekend Complete.',
  };

  return statusByPhase[experience.phase];
}

function getSiteUrl(): string {
  if (typeof window === 'undefined') return 'https://gpcountdown.com';
  return window.location.origin;
}

function filenameFor(format: ShareCardFormat, raceName: string): string {
  const slug = raceName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `gpcountdown-${slug}-${format === 'x' ? 'x-card' : 'story'}.png`;
}

export default function PremiumSharePanel({
  nextRace,
  raceWeekExperience,
  timezone,
  timezoneLabel,
}: PremiumSharePanelProps) {
  const [format, setFormat] = useState<ShareCardFormat>('x');
  const [previewUrl, setPreviewUrl] = useState('');
  const [status, setStatus] = useState<ShareStatus>('generating');
  const { theme } = useTheme();
  const targetTime = nextRace.nextSession?.date_start ?? null;
  const countdown = useCountdown(targetTime);

  const raceName = nextRace.race.meeting.meeting_name;
  const nextSessionName = nextRace.nextSession ? getSessionDisplayName(nextRace.nextSession) : 'Race Weekend';
  const cardData: ShareCardData = useMemo(() => ({
    raceName,
    circuitName: nextRace.race.meeting.circuit_short_name,
    countdown: {
      days: countdown.days,
      hours: countdown.hours,
      minutes: countdown.minutes,
      seconds: countdown.seconds,
    },
    nextSession: nextSessionName,
    sessionStart: formatSessionStart(nextRace.nextSession?.date_start, timezone),
    raceWeekStatus: getRaceWeekStatus(raceWeekExperience),
    timezoneLabel,
    theme,
    format,
  }), [
    countdown.days,
    countdown.hours,
    countdown.minutes,
    countdown.seconds,
    format,
    nextRace.nextSession?.date_start,
    nextRace.race.meeting.circuit_short_name,
    nextSessionName,
    raceName,
    raceWeekExperience,
    theme,
    timezone,
    timezoneLabel,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function createPreview() {
      setStatus('generating');

      try {
        const dataUrl = await renderShareCard(cardData);
        if (!cancelled) {
          setPreviewUrl(dataUrl);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) setStatus('idle');
      }
    }

    createPreview();

    return () => {
      cancelled = true;
    };
  }, [cardData]);

  async function getFreshCard(): Promise<string> {
    setStatus('generating');
    const dataUrl = await renderShareCard(cardData);
    setPreviewUrl(dataUrl);
    return dataUrl;
  }

  async function handleDownload(eventName: 'share_card_download' | 'instagram_story_download') {
    const dataUrl = await getFreshCard();
    downloadDataUrl(dataUrl, filenameFor(format, raceName));
    setStatus('downloaded');
    trackShareEvent(eventName, {
      format,
      raceName,
      sessionName: nextSessionName,
      theme,
    });
  }

  async function handleXShare() {
    const dataUrl = await getFreshCard();
    downloadDataUrl(dataUrl, filenameFor('x', raceName));
    setStatus('downloaded');
    trackShareEvent('x_share', {
      format: 'x',
      raceName,
      sessionName: nextSessionName,
      theme,
    });

    const text = [
      `\uD83C\uDFC1 ${raceName} in ${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`,
      '',
      'Track every session with GPCountdown.',
      '',
      'Every Second Matters.',
      '',
      getSiteUrl(),
      '',
      '#F1',
    ].join('\n');

    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  }

  async function copyInstagramCaption() {
    await navigator.clipboard.writeText(INSTAGRAM_CAPTION);
    setStatus('copied');
  }

  const statusLabel = {
    idle: 'Ready when you are',
    generating: 'Generating card...',
    ready: 'Ready to share',
    downloaded: 'Download complete',
    copied: 'Caption copied',
  }[status];

  return (
    <div className="mx-auto mb-12 w-full max-w-5xl px-2">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)]">
        <div className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-[var(--text-tertiary)]">Share Card Preview</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{statusLabel}</p>
            </div>
            <div className="inline-flex rounded-md border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-1">
              <button
                type="button"
                onClick={() => setFormat('x')}
                className={`rounded px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${format === 'x' ? 'bg-[var(--active-card-bg)] text-[var(--active-card-text)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
              >
                X Preview
              </button>
              <button
                type="button"
                onClick={() => setFormat('instagram')}
                className={`rounded px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${format === 'instagram' ? 'bg-[var(--active-card-bg)] text-[var(--active-card-text)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`}
              >
                Instagram
              </button>
            </div>
          </div>

          <div className="flex min-h-[260px] items-center justify-center rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={`${format === 'x' ? 'X' : 'Instagram Story'} share card preview for ${raceName}`}
                className={`w-full object-contain shadow-[0_20px_80px_rgba(0,0,0,0.18)] ${format === 'x' ? 'max-h-[360px]' : 'max-h-[560px]'}`}
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
                <Loader2 className="size-4 animate-spin" />
                Generating card...
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <Share2 className="size-4" />
            <h2 className="text-base font-semibold">Premium Sharing</h2>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            Live countdown cards for X and Instagram Stories, generated from the current race weekend.
          </p>

          <div className="mt-6 grid gap-3">
            <Button
              type="button"
              onClick={handleXShare}
              className="h-11 bg-[var(--active-card-bg)] text-[var(--active-card-text)] hover:opacity-90"
            >
              {status === 'generating' ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
              Share on X
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDownload('instagram_story_download')}
              className="h-11 border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
            >
              <Instagram className="size-4" />
              Share to Instagram Story
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDownload('share_card_download')}
              className="h-11 border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]"
            >
              <Download className="size-4" />
              Download Share Card
            </Button>
          </div>

          {status === 'downloaded' && (
            <div className="mt-5 animate-slide-up rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-4 text-sm text-[var(--text-secondary)]">
              <div className="mb-2 flex items-center gap-2 font-medium text-[var(--text-primary)]">
                <Check className="size-4" />
                Your share card has been downloaded.
              </div>
              {format === 'x' ? (
                <p>Attach it to your X post before publishing.</p>
              ) : (
                <div className="space-y-3">
                  <p>Open Instagram, create a Story, select the downloaded image, then share it with your followers.</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={copyInstagramCaption}
                    className="border-[var(--border-subtle)] bg-transparent text-[var(--text-primary)]"
                  >
                    <Copy className="size-3.5" />
                    Copy Caption
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

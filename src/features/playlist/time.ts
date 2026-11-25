/** Time text shared by the cards and the playlist section. Pure. */
import { createContext } from 'react';
import { buildTimezoneLabel } from '@/data/timezones';

/** Studio only: pretend it is this moment. null (always, on the live site) = the real clock. */
export const NowContext = createContext<Date | null>(null);

/** "3d 14h 22m", "14h 22m", "42m" */
export function formatLeft(leftMs: number): string {
  const minutes = Math.floor(leftMs / 60_000);
  if (minutes < 1) return '<1m';
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function parts(at: number, timeZone: string): Record<string, string> {
  const list = new Intl.DateTimeFormat('en-GB', {
    timeZone, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(at));
  return Object.fromEntries(list.map(p => [p.type, p.value]));
}

/** "Sun 29 Nov" */
export function formatDay(at: number, timeZone: string, weekday = true): string {
  const p = parts(at, timeZone);
  const month = p.month.slice(0, 3); // en-GB writes "Sept"
  return `${weekday ? `${p.weekday} ` : ''}${p.day} ${month}`;
}

/** "21:30" */
export function formatClock(at: number, timeZone: string): string {
  const p = parts(at, timeZone);
  return `${p.hour}:${p.minute}`;
}

/** "Sun 29 Nov · 21:30 India (GMT+5:30)", with the offset in force on that date */
export function formatMoment(at: number, timeZone: string, weekday = true): string {
  return `${formatDay(at, timeZone, weekday)} · ${formatClock(at, timeZone)} ${buildTimezoneLabel(timeZone, new Date(at))}`;
}

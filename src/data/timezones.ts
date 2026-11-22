export interface TimezoneOption {
  label: string;
  value: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { label: 'GMT', value: 'UTC' },
  { label: 'London', value: 'Europe/London' },
  { label: 'Paris', value: 'Europe/Paris' },
  { label: 'New York', value: 'America/New_York' },
  { label: 'Los Angeles', value: 'America/Los_Angeles' },
  { label: 'India', value: 'Asia/Kolkata' },
  { label: 'Dubai', value: 'Asia/Dubai' },
  { label: 'Singapore', value: 'Asia/Singapore' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
  { label: 'Sydney', value: 'Australia/Sydney' },
  { label: 'Sao Paulo', value: 'America/Sao_Paulo' }
];

// Browsers sometimes report an older name for the same zone (Chrome says
// "Asia/Calcutta" for India). Map those to the names used in TIMEZONE_OPTIONS.
const TIMEZONE_ALIASES: Record<string, string> = {
  'Asia/Calcutta': 'Asia/Kolkata',
  'Etc/UTC': 'UTC',
  'Etc/GMT': 'UTC',
  'GMT': 'UTC',
};

export function normalizeTimezone(timezone: string): string {
  return TIMEZONE_ALIASES[timezone] || timezone;
}

/** Name shown to people: the picker's name if it is in the list, else the city from the zone id. */
export function getTimezoneName(timezone: string): string {
  const tz = normalizeTimezone(timezone);
  const known = TIMEZONE_OPTIONS.find(o => o.value === tz);
  if (known) return known.label;
  return tz.split('/').pop()?.replace(/_/g, ' ') || 'Local';
}

/** Offset such as "GMT+5:30". Pass the date it applies to: the offset changes with daylight saving. */
export function getTimezoneOffsetLabel(timezone: string, at: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: normalizeTimezone(timezone),
      timeZoneName: 'shortOffset'
    });
    const parts = formatter.formatToParts(at);
    const offset = parts.find(p => p.type === 'timeZoneName')?.value;
    if (!offset) return timezone;
    return offset === 'GMT' ? 'GMT+0' : offset;
  } catch {
    return timezone;
  }
}

/** "India (GMT+5:30)". For a race, pass its date so the offset is the one in force that day. */
export function buildTimezoneLabel(timezone: string, at: Date = new Date()): string {
  return `${getTimezoneName(timezone)} (${getTimezoneOffsetLabel(timezone, at)})`;
}

/** Picker entries: the standard list, plus the visitor's own zone and the active one if they are missing. */
export function buildTimezoneOptions(active: string, detected: string): TimezoneOption[] {
  const options = [...TIMEZONE_OPTIONS];
  const has = (tz: string) => options.some(o => o.value === tz);
  const extras: TimezoneOption[] = [];
  const d = normalizeTimezone(detected);
  if (!has(d)) extras.push({ label: `${getTimezoneName(d)} (your time zone)`, value: d });
  const a = normalizeTimezone(active);
  if (!has(a) && a !== d) extras.push({ label: getTimezoneName(a), value: a });
  return [...extras, ...options];
}

/** "FRI 27 NOV" for a moment, in the given zone (the day can differ between zones). */
export function formatShortDateInZone(utcString: string, timezone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: normalizeTimezone(timezone),
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    }).formatToParts(new Date(utcString));
    const get = (type: string) => parts.find(p => p.type === type)?.value || '';
    return `${get('weekday')} ${get('day')} ${get('month')}`.toUpperCase();
  } catch {
    return '--- -- ---';
  }
}

export function detectUserTimezone(): string {
  try {
    return normalizeTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return 'Asia/Kolkata';
  }
}

export function formatTimeInZone(utcString: string, timezone: string): string {
  try {
    const date = new Date(utcString);
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--:--';
  }
}

export function formatDateInZone(utcString: string, timezone: string): string {
  try {
    const date = new Date(utcString);
    return date.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    }).toUpperCase();
  } catch {
    return '--- -- ---';
  }
}

export function formatRaceTimeInZone(utcTime: string, date: string, timezone: string): string {
  try {
    const dateTimeString = `${date}T${utcTime}:00Z`;
    const d = new Date(dateTimeString);
    return d.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--:--';
  }
}

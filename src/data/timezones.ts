export interface TimezoneOption {
  label: string;
  value: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { label: 'UTC', value: 'UTC' },
  { label: 'United Kingdom', value: 'Europe/London' },
  { label: 'Central Europe', value: 'Europe/Paris' },
  { label: 'New York', value: 'America/New_York' },
  { label: 'Los Angeles', value: 'America/Los_Angeles' },
  { label: 'Mumbai (IST)', value: 'Asia/Kolkata' },
  { label: 'Dubai', value: 'Asia/Dubai' },
  { label: 'Singapore', value: 'Asia/Singapore' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
  { label: 'Sydney', value: 'Australia/Sydney' },
  { label: 'São Paulo', value: 'America/Sao_Paulo' }
];

const TIMEZONE_CANONICAL_MAP: Record<string, string> = {
  'Asia/Calcutta': 'Asia/Kolkata',
};

const TIMEZONE_DISPLAY_MAP: Record<string, string> = {
  UTC: 'UTC',
  'Europe/London': 'United Kingdom',
  'Europe/Paris': 'Central Europe',
  'America/New_York': 'New York',
  'America/Los_Angeles': 'Los Angeles',
  'Asia/Kolkata': 'Mumbai',
  'Asia/Calcutta': 'Mumbai',
  'Asia/Dubai': 'Dubai',
  'Asia/Singapore': 'Singapore',
  'Asia/Tokyo': 'Tokyo',
  'Australia/Sydney': 'Sydney',
  'America/Sao_Paulo': 'São Paulo',
};

const TIMEZONE_SHORT_LABELS: Record<string, string> = {
  UTC: 'UTC',
  'Asia/Kolkata': 'IST',
  'Asia/Calcutta': 'IST',
};

export function canonicalizeTimezone(timezone: string): string {
  return TIMEZONE_CANONICAL_MAP[timezone] || timezone;
}

export function getTimezoneShortCode(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(new Date());
    return parts.find((part) => part.type === 'timeZoneName')?.value || timezone;
  } catch {
    return timezone;
  }
}

export function getTimezoneDisplayLabel(timezone: string): string {
  const normalizedTimezone = canonicalizeTimezone(timezone);
  const prefix = TIMEZONE_DISPLAY_MAP[normalizedTimezone] || normalizedTimezone.split('/').pop()?.replace(/_/g, ' ') || 'User Timezone';
  const shortCode = TIMEZONE_SHORT_LABELS[normalizedTimezone] || getTimezoneShortCode(normalizedTimezone);

  return prefix === shortCode ? prefix : `${prefix} (${shortCode})`;
}

export function getTimezoneOffsetLabel(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    });
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find(p => p.type === 'timeZoneName');
    return offsetPart?.value || timezone;
  } catch {
    return timezone;
  }
}

export function detectUserTimezone(): string {
  try {
    return canonicalizeTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    return 'UTC';
  }
}

export function formatTimeInZone(utcString: string, timezone: string): string {
  try {
    const date = new Date(utcString);
    return date.toLocaleTimeString('en-US', {
      timeZone: canonicalizeTimezone(timezone),
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
      timeZone: canonicalizeTimezone(timezone),
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    }).toUpperCase();
  } catch {
    return '--- -- ---';
  }
}

export function formatDateTimeInZone(utcString: string, timezone: string): string {
  try {
    const date = new Date(utcString);
    return date.toLocaleString('en-US', {
      timeZone: canonicalizeTimezone(timezone),
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '---';
  }
}

export function formatRaceTimeInZone(utcTime: string, date: string, timezone: string): string {
  try {
    const dateTimeString = `${date}T${utcTime}:00Z`;
    const d = new Date(dateTimeString);
    return d.toLocaleTimeString('en-US', {
      timeZone: canonicalizeTimezone(timezone),
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--:--';
  }
}

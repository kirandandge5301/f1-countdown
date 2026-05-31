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
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
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

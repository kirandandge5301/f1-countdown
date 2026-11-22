import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import {
  detectUserTimezone,
  normalizeTimezone,
  buildTimezoneLabel,
  buildTimezoneOptions,
  formatTimeInZone,
  formatDateInZone,
  type TimezoneOption
} from '@/data/timezones';

interface TimezoneContextType {
  timezone: string;
  timezoneLabel: string;        // e.g. "India (GMT+5:30)", offset as of today
  timezoneOptions: TimezoneOption[];
  setTimezone: (tz: string) => void;
  formatTime: (utcString: string) => string;
  formatDate: (utcString: string) => string;
}

const TimezoneContext = createContext<TimezoneContextType>({
  timezone: 'Asia/Kolkata',
  timezoneLabel: 'India (GMT+5:30)',
  timezoneOptions: [],
  setTimezone: () => {},
  formatTime: () => '--:--',
  formatDate: () => '---'
});

const STORAGE_KEY = 'gpcountdown-tz';

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const detected = useMemo(() => detectUserTimezone(), []);

  const [timezone, setTimezoneState] = useState<string>(() => {
    // Saved choice first, else the visitor's own zone. Storage can be blocked (private mode).
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return normalizeTimezone(saved);
    } catch {
      // ignore
    }
    return detected;
  });

  // Computed, not stored: no flash of a wrong default label on first paint
  const timezoneLabel = useMemo(() => buildTimezoneLabel(timezone), [timezone]);
  const timezoneOptions = useMemo(() => buildTimezoneOptions(timezone, detected), [timezone, detected]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, timezone);
    } catch {
      // ignore
    }
  }, [timezone]);

  const setTimezone = useCallback((tz: string) => {
    setTimezoneState(normalizeTimezone(tz));
  }, []);

  const formatTime = useCallback((utcString: string) => {
    return formatTimeInZone(utcString, timezone);
  }, [timezone]);

  const formatDate = useCallback((utcString: string) => {
    return formatDateInZone(utcString, timezone);
  }, [timezone]);

  return (
    <TimezoneContext.Provider value={{
      timezone,
      timezoneLabel,
      timezoneOptions,
      setTimezone,
      formatTime,
      formatDate
    }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  return useContext(TimezoneContext);
}

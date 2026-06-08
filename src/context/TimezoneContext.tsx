import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { detectUserTimezone, getTimezoneDisplayLabel, formatTimeInZone, formatDateInZone, canonicalizeTimezone } from '@/data/timezones';

interface TimezoneContextType {
  timezone: string;
  timezoneLabel: string;
  setTimezone: (tz: string) => void;
  formatTime: (utcString: string) => string;
  formatDate: (utcString: string) => string;
}

const TimezoneContext = createContext<TimezoneContextType>({
  timezone: 'UTC',
  timezoneLabel: 'UTC',
  setTimezone: () => {},
  formatTime: () => '--:--',
  formatDate: () => '---'
});

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [timezone, setTimezoneState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gpcountdown-tz');
      if (saved) return canonicalizeTimezone(saved);
      
      // Auto-detect user's real local timezone
      const detected = detectUserTimezone();
      return detected;
    }
    return 'UTC';
  });

  const [timezoneLabel, setTimezoneLabel] = useState<string>('UTC');

  useEffect(() => {
    setTimezoneLabel(getTimezoneDisplayLabel(timezone));
  }, [timezone]);

  useEffect(() => {
    localStorage.setItem('gpcountdown-tz', canonicalizeTimezone(timezone));
  }, [timezone]);

  const setTimezone = useCallback((tz: string) => {
    setTimezoneState(canonicalizeTimezone(tz));
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

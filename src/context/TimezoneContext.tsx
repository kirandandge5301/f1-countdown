import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { detectUserTimezone, getTimezoneOffsetLabel, formatTimeInZone, formatDateInZone } from '@/data/timezones';

interface TimezoneContextType {
  timezone: string;
  timezoneLabel: string;
  setTimezone: (tz: string) => void;
  formatTime: (utcString: string) => string;
  formatDate: (utcString: string) => string;
}

const TimezoneContext = createContext<TimezoneContextType>({
  timezone: 'Asia/Kolkata',
  timezoneLabel: 'GMT+5:30',
  setTimezone: () => {},
  formatTime: () => '--:--',
  formatDate: () => '---'
});

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [timezone, setTimezoneState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gpcountdown-tz');
      if (saved) return saved;
      return detectUserTimezone();
    }
    return 'Asia/Kolkata';
  });

  const [timezoneLabel, setTimezoneLabel] = useState<string>('GMT+5:30');

  useEffect(() => {
    setTimezoneLabel(getTimezoneOffsetLabel(timezone));
  }, [timezone]);

  useEffect(() => {
    localStorage.setItem('gpcountdown-tz', timezone);
  }, [timezone]);

  const setTimezone = useCallback((tz: string) => {
    setTimezoneState(tz);
  }, []);

  const formatTime = useCallback((utcString: string) => {
    return formatTimeInZone(utcString, timezone);
  }, [timezone]);

  const formatDate = useCallback((utcString: string) => {
    return formatDateInZone(utcString, timezone);
  }, [timezone]);

  return (
    <TimezoneContext.Provider value={{ timezone, timezoneLabel, setTimezone, formatTime, formatDate }}>
      {children}
    </TimezoneContext.Provider>
  );
}

export function useTimezone() {
  return useContext(TimezoneContext);
}

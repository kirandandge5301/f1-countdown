import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { detectUserTimezone, getTimezoneOffsetLabel, formatTimeInZone, formatDateInZone } from '@/data/timezones';

interface TimezoneContextType {
  timezone: string;
  timezoneLabel: string;        // e.g. "Mumbai (GMT+5:30)"
  setTimezone: (tz: string) => void;
  formatTime: (utcString: string) => string;
  formatDate: (utcString: string) => string;
}

const TimezoneContext = createContext<TimezoneContextType>({
  timezone: 'Asia/Kolkata',
  timezoneLabel: 'Mumbai (GMT+5:30)',
  setTimezone: () => {},
  formatTime: () => '--:--',
  formatDate: () => '---'
});

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [timezone, setTimezoneState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gpcountdown-tz');
      if (saved) return saved;
      
      // Auto-detect user's real local timezone
      const detected = detectUserTimezone();
      return detected;
    }
    return 'Asia/Kolkata';
  });

  const [timezoneLabel, setTimezoneLabel] = useState<string>('Mumbai (GMT+5:30)');

  useEffect(() => {
    const label = getTimezoneOffsetLabel(timezone);
    // Make it more user-friendly: City (GMT Offset)
    const city = timezone.split('/').pop()?.replace(/_/g, ' ') || 'Local';
    setTimezoneLabel(`${city} (${label})`);
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

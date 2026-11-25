import { useContext, useEffect, useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { nextPlaylistChange, type CalendarInfo } from './playlistState';
import { NowContext } from './time';

export function useCalendarInfo(): CalendarInfo {
  const { raceWeekends, activeSeason, seasonStatus } = useData();
  return useMemo(
    () => ({ weekends: raceWeekends, season: activeSeason, status: seasonStatus }),
    [raceWeekends, activeSeason, seasonStatus]
  );
}

/**
 * The current time, moved forward every minute and exactly when a reveal, drop or week
 * boundary passes. In Studio it is the pretend time instead, and stands still.
 */
export function useSiteNow(): Date {
  const override = useContext(NowContext);
  const { content } = useData();
  const cal = useCalendarInfo();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (override) return;
    const t = Date.now();
    const minute = 60_000 - (t % 60_000);
    const change = nextPlaylistChange(content, cal, new Date(t));
    const wait = change === null ? minute : Math.min(minute, change - t);
    const id = setTimeout(() => setNow(new Date()), wait + 20);
    return () => clearTimeout(id);
  }, [now, override, content, cal]);

  return override ?? now;
}

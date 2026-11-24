import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react';
import {
  fetchSeasonCalendar,
  getActiveSeason,
  getHeroState,
  lastFinishedRound,
  nextBoundaryTime,
  fetchEnrichedDriverStandings,
  fetchEnrichedConstructorStandings,
  type HeroState,
  type SeasonStatus
} from '@/services/openf1';

const CALENDAR_ERROR = "Couldn't load the race calendar right now.";

const REFRESH_EVERY_MS = 15 * 60 * 1000;     // quiet background refresh while the page is open
const REFRESH_ON_RETURN_MS = 5 * 60 * 1000;  // refresh when the tab comes back after being away this long
const ROLLOVER_RETRY_MS = 5 * 60 * 1000;     // at most one season-rollover reload per this long
const MAX_TIMER_MS = 6 * 60 * 60 * 1000;     // setTimeout can't take huge delays: re-check at least this often

const DataContext = createContext<any>({
  raceWeekends: [],
  nextRace: null,
  heroState: null,
  activeSeason: new Date().getUTCFullYear(),
  seasonStatus: null,
  calendarError: null,
  calendarLoading: false,
  totalRounds: 0,
  driverStandings: [],
  constructorStandings: [],
  standingsError: null,
  standingsUpdatedAt: null,
  standingsRound: null,
  standingsFinalSeason: null,
  standingsLoading: false,
  loading: true,
  refresh: () => {},
  refreshCalendar: () => {},
  refreshStandings: () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [raceWeekends, setRaceWeekends] = useState<any[]>([]);
  const [activeSeason, setActiveSeason] = useState<number>(() => new Date().getUTCFullYear());
  const [seasonStatus, setSeasonStatus] = useState<SeasonStatus | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [driverStandings, setDriverStandings] = useState<any[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<any[]>([]);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [standingsUpdatedAt, setStandingsUpdatedAt] = useState<Date | null>(null);
  // The round Jolpica reports for the standings (can run ahead of the points, see below)
  const [standingsReportedRound, setStandingsReportedRound] = useState<number | null>(null);
  const [standingsFinalSeason, setStandingsFinalSeason] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // "What time is it for the page": moves forward only when something on the page can
  // change (a session starts or ends), so the hero updates without a reload.
  const [now, setNow] = useState<Date>(() => new Date());

  // Whether there is good data on screen: a failed BACKGROUND refresh must not wipe it
  const hasCalendar = useRef(false);
  const hasStandings = useRef(false);
  const lastRefreshAt = useRef(Date.now());
  const lastRolloverTry = useRef(0);

  // What the hero shows now: worked out from the calendar and the current time
  const heroState = useMemo<HeroState | null>(() => {
    if (calendarError || !seasonStatus) return null;
    return getHeroState(now, { year: activeSeason, weekends: raceWeekends, status: seasonStatus });
  }, [now, calendarError, seasonStatus, activeSeason, raceWeekends]);
  const nextRace = heroState?.kind === 'race' ? heroState.next : null;

  // "After Round N" only for a race that has really finished. Jolpica may report round N
  // once that weekend's qualifying is in, while the points are still those after N-1.
  // If the calendar isn't available we can't verify the round, so we show none.
  const standingsRound = useMemo(() => {
    if (!standingsReportedRound || standingsFinalSeason) return null;
    const finished = lastFinishedRound(raceWeekends, now);
    return finished > 0 ? Math.min(standingsReportedRound, finished) : null;
  }, [standingsReportedRound, standingsFinalSeason, raceWeekends, now]);

  // No static fallback: if the calendar can't be loaded we say so (error + Retry)
  // instead of showing hard-coded dates as if they were live.
  const failCalendar = useCallback(() => {
    hasCalendar.current = false;
    setRaceWeekends([]);
    setTotalRounds(0);
    setSeasonStatus('unavailable');
    setCalendarError(CALENDAR_ERROR);
  }, []);

  // silent = a background refresh: if it fails, keep what is already on screen
  const loadCalendar = useCallback(async (silent: boolean = false) => {
    try {
      const at = new Date();
      const thisYear = at.getUTCFullYear();

      // This year's calendar decides which season to show
      const current = await fetchSeasonCalendar(thisYear);
      const season = getActiveSeason(at, { [thisYear]: current.weekends });
      const shown = season === thisYear ? current : await fetchSeasonCalendar(season);

      if (shown.status === 'unavailable') {
        if (silent && hasCalendar.current) {
          console.warn('Calendar refresh failed; keeping the calendar already on screen');
          return;
        }
        console.error(`Race calendar for ${season} could not be loaded`);
        setActiveSeason(season);
        failCalendar();
        return;
      }

      hasCalendar.current = true;
      setActiveSeason(season);
      setSeasonStatus(shown.status);
      setRaceWeekends(shown.weekends);
      setTotalRounds(shown.totalRounds);
      setCalendarError(null);
      setNow(new Date());
    } catch (error) {
      if (silent && hasCalendar.current) {
        console.warn('Calendar refresh failed; keeping the calendar already on screen', error);
        return;
      }
      console.error('Error loading calendar:', error);
      failCalendar();
    }
  }, [failCalendar]);

  const loadStandings = useCallback(async (silent: boolean = false) => {
    try {
      // Live championship standings from Jolpica — no fallback numbers on failure
      const [drivers, constructors] = await Promise.all([
        fetchEnrichedDriverStandings(),
        fetchEnrichedConstructorStandings(),
      ]);

      hasStandings.current = true;
      setDriverStandings(drivers.standings);
      setConstructorStandings(constructors.standings);
      setStandingsReportedRound(drivers.round || constructors.round || null);
      setStandingsFinalSeason(drivers.isFinal ? drivers.season : null);
      setStandingsUpdatedAt(new Date());
      setStandingsError(null);
    } catch (error) {
      // A failed background refresh keeps the standings on screen; their
      // "Last updated" time still says how old they are.
      if (silent && hasStandings.current) {
        console.warn('Standings refresh failed; keeping the standings already on screen', error);
        return;
      }
      console.error('Error loading standings:', error);
      hasStandings.current = false;
      setDriverStandings([]);
      setConstructorStandings([]);
      setStandingsReportedRound(null);
      setStandingsFinalSeason(null);
      setStandingsUpdatedAt(null);
      setStandingsError("Couldn't load standings right now.");
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    lastRefreshAt.current = Date.now();
    try {
      await Promise.all([loadCalendar(), loadStandings()]);
    } finally {
      setLoading(false);
    }
  }, [loadCalendar, loadStandings]);

  // Background refresh: no loading placeholders, nothing wiped if it fails
  const silentRefresh = useCallback(async () => {
    lastRefreshAt.current = Date.now();
    await Promise.all([loadCalendar(true), loadStandings(true)]);
  }, [loadCalendar, loadStandings]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 1. Re-check the page at the next moment something can change (session start/end)
  useEffect(() => {
    if (raceWeekends.length === 0) return;
    const nowMs = Date.now();
    const boundary = nextBoundaryTime(raceWeekends, nowMs);
    const wait = boundary === null
      ? MAX_TIMER_MS
      : Math.min(Math.max(boundary - nowMs + 1000, 1000), MAX_TIMER_MS);
    const id = setTimeout(() => setNow(new Date()), wait);
    return () => clearTimeout(id);
  }, [raceWeekends, now]);

  // 2. When the season's last race is over, load the next season without a reload
  useEffect(() => {
    if (raceWeekends.length === 0) return;
    const year = now.getUTCFullYear();
    if (activeSeason !== year) return;
    if (getActiveSeason(now, { [year]: raceWeekends }) === year) return;
    if (Date.now() - lastRolloverTry.current < ROLLOVER_RETRY_MS) return;
    lastRolloverTry.current = Date.now();
    void silentRefresh();
  }, [now, activeSeason, raceWeekends, silentRefresh]);

  // 3. Keep the data fresh while the page stays open, and when the tab comes back
  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') void silentRefresh();
    };
    const id = setInterval(refreshIfVisible, REFRESH_EVERY_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastRefreshAt.current > REFRESH_ON_RETURN_MS) {
        void silentRefresh();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [silentRefresh]);

  const refresh = () => loadData();

  // Retry buttons reload only their own part, so the other sections don't flash
  const [calendarLoading, setCalendarLoading] = useState(false);
  const refreshCalendar = async () => {
    setCalendarLoading(true);
    try {
      await loadCalendar();
    } finally {
      setCalendarLoading(false);
    }
  };

  const [standingsLoading, setStandingsLoading] = useState(false);
  const refreshStandings = async () => {
    setStandingsLoading(true);
    try {
      await loadStandings();
    } finally {
      setStandingsLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{
      raceWeekends,
      nextRace,
      heroState,
      activeSeason,
      seasonStatus,
      calendarError,
      calendarLoading,
      totalRounds,
      driverStandings,
      constructorStandings,
      standingsError,
      standingsUpdatedAt,
      standingsRound,
      standingsFinalSeason,
      standingsLoading,
      loading,
      refresh,
      refreshCalendar,
      refreshStandings,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

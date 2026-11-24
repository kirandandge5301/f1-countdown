import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import {
  fetchSeasonCalendar,
  getActiveSeason,
  getHeroState,
  lastFinishedRound,
  fetchEnrichedDriverStandings,
  fetchEnrichedConstructorStandings,
  type HeroState,
  type SeasonStatus
} from '@/services/openf1';

const CALENDAR_ERROR = "Couldn't load the race calendar right now.";

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
  const [nextRace, setNextRace] = useState<any>(null);
  const [heroState, setHeroState] = useState<HeroState | null>(null);
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

  // "After Round N" only for a race that has really finished. Jolpica may report round N
  // once that weekend's qualifying is in, while the points are still those after N-1.
  // If the calendar isn't available we can't verify the round, so we show none.
  const standingsRound = useMemo(() => {
    if (!standingsReportedRound || standingsFinalSeason) return null;
    const finished = lastFinishedRound(raceWeekends, new Date());
    return finished > 0 ? Math.min(standingsReportedRound, finished) : null;
  }, [standingsReportedRound, standingsFinalSeason, raceWeekends]);

  // No static fallback: if the calendar can't be loaded we say so (error + Retry)
  // instead of showing hard-coded dates as if they were live.
  const failCalendar = useCallback(() => {
    setRaceWeekends([]);
    setNextRace(null);
    setHeroState(null);
    setTotalRounds(0);
    setSeasonStatus('unavailable');
    setCalendarError(CALENDAR_ERROR);
  }, []);

  const loadCalendar = useCallback(async () => {
    try {
      const now = new Date();
      const thisYear = now.getUTCFullYear();

      // This year's calendar decides which season to show
      const current = await fetchSeasonCalendar(thisYear);
      const season = getActiveSeason(now, { [thisYear]: current.weekends });
      const shown = season === thisYear ? current : await fetchSeasonCalendar(season);

      if (shown.status === 'unavailable') {
        console.error(`Race calendar for ${season} could not be loaded`);
        setActiveSeason(season);
        failCalendar();
        return;
      }

      const hero = getHeroState(now, { year: season, weekends: shown.weekends, status: shown.status });

      setActiveSeason(season);
      setSeasonStatus(shown.status);
      setRaceWeekends(shown.weekends);
      setTotalRounds(shown.totalRounds);
      setHeroState(hero);
      setNextRace(hero.kind === 'race' ? hero.next : null);
      setCalendarError(null);
    } catch (error) {
      console.error('Error loading calendar:', error);
      failCalendar();
    }
  }, [failCalendar]);

  const loadStandings = useCallback(async () => {
    try {
      // Live championship standings from Jolpica — no fallback numbers on failure
      const [drivers, constructors] = await Promise.all([
        fetchEnrichedDriverStandings(),
        fetchEnrichedConstructorStandings(),
      ]);

      setDriverStandings(drivers.standings);
      setConstructorStandings(constructors.standings);
      setStandingsReportedRound(drivers.round || constructors.round || null);
      setStandingsFinalSeason(drivers.isFinal ? drivers.season : null);
      setStandingsUpdatedAt(new Date());
      setStandingsError(null);
    } catch (error) {
      console.error('Error loading standings:', error);
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
    try {
      await Promise.all([loadCalendar(), loadStandings()]);
    } finally {
      setLoading(false);
    }
  }, [loadCalendar, loadStandings]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

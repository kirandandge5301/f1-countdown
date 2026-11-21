import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { RACES as FALLBACK_RACES } from '@/data/races';
import {
  fetchSeasonCalendar,
  getActiveSeason,
  getHeroState,
  fetchEnrichedDriverStandings,
  fetchEnrichedConstructorStandings,
  type HeroState,
  type SeasonStatus
} from '@/services/openf1';

// Year the static fallback calendar belongs to, read from its own data
const FALLBACK_YEAR = FALLBACK_RACES.length ? new Date(FALLBACK_RACES[0].date).getUTCFullYear() : NaN;

const DataContext = createContext<any>({
  raceWeekends: [],
  nextRace: null,
  heroState: null,
  activeSeason: new Date().getUTCFullYear(),
  seasonStatus: null,
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
  refreshStandings: () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [raceWeekends, setRaceWeekends] = useState<any[]>([]);
  const [nextRace, setNextRace] = useState<any>(null);
  const [heroState, setHeroState] = useState<HeroState | null>(null);
  const [activeSeason, setActiveSeason] = useState<number>(() => new Date().getUTCFullYear());
  const [seasonStatus, setSeasonStatus] = useState<SeasonStatus | null>(null);
  const [totalRounds, setTotalRounds] = useState<number>(0);
  const [driverStandings, setDriverStandings] = useState<any[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<any[]>([]);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [standingsUpdatedAt, setStandingsUpdatedAt] = useState<Date | null>(null);
  const [standingsRound, setStandingsRound] = useState<number | null>(null);
  const [standingsFinalSeason, setStandingsFinalSeason] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCalendar = useCallback(async () => {
    try {
      const now = new Date();
      const thisYear = now.getUTCFullYear();

      // This year's calendar decides which season to show
      const current = await fetchSeasonCalendar(thisYear);
      const season = getActiveSeason(now, { [thisYear]: current.weekends });
      const shown = season === thisYear ? current : await fetchSeasonCalendar(season);

      let weekends = shown.weekends;
      let total = shown.totalRounds;
      let status = shown.status;

      // Fall back to static data if API fails or returns empty — only when the
      // static calendar is for the season being shown (never show it as another year)
      if (weekends.length === 0 && FALLBACK_YEAR === season) {
        console.warn('OpenF1 API returned no races, using fallback calendar');
        weekends = FALLBACK_RACES.map((r: any) => ({
          round: r.round,
          meeting: {
            meeting_name: r.gp,
            circuit_short_name: r.circuit,
            country_code: r.country,
          },
          sessions: Object.entries(r.sessions || {}).map(([key, date]: any) => ({
            session_key: Date.now(),
            session_type: key,
            date_start: date,
          })),
          isSprint: !!r.sprint,
        })) as any;
        total = weekends.length;
        status = 'live';
      }

      const hero = getHeroState(now, { year: season, weekends, status });

      setActiveSeason(season);
      setSeasonStatus(status);
      setRaceWeekends(weekends);
      setTotalRounds(total);
      setHeroState(hero);
      setNextRace(hero.kind === 'race' ? hero.next : null);
    } catch (error) {
      console.error('Error loading calendar:', error);
    }
  }, []);

  const loadStandings = useCallback(async () => {
    try {
      // Live championship standings from Jolpica — no fallback numbers on failure
      const [drivers, constructors] = await Promise.all([
        fetchEnrichedDriverStandings(),
        fetchEnrichedConstructorStandings(),
      ]);

      setDriverStandings(drivers.standings);
      setConstructorStandings(constructors.standings);
      setStandingsRound(drivers.round || constructors.round || null);
      setStandingsFinalSeason(drivers.isFinal ? drivers.season : null);
      setStandingsUpdatedAt(new Date());
      setStandingsError(null);
    } catch (error) {
      console.error('Error loading standings:', error);
      setDriverStandings([]);
      setConstructorStandings([]);
      setStandingsRound(null);
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

  // Reload only standings (e.g. Retry button) without flashing the calendar sections
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
      refreshStandings,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

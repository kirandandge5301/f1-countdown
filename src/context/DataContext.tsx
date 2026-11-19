import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { RACES as FALLBACK_RACES } from '@/data/races';
import {
  findNextRace,
  fetchRaceWeekends,
  fetchEnrichedDriverStandings,
  fetchEnrichedConstructorStandings
} from '@/services/openf1';

const DataContext = createContext<any>({
  raceWeekends: [],
  nextRace: null,
  driverStandings: [],
  constructorStandings: [],
  standingsError: null,
  standingsUpdatedAt: null,
  standingsRound: null,
  standingsLoading: false,
  loading: true,
  refresh: () => {},
  refreshStandings: () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [raceWeekends, setRaceWeekends] = useState<any[]>([]);
  const [nextRace, setNextRace] = useState<any>(null);
  const [driverStandings, setDriverStandings] = useState<any[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<any[]>([]);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [standingsUpdatedAt, setStandingsUpdatedAt] = useState<Date | null>(null);
  const [standingsRound, setStandingsRound] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCalendar = useCallback(async () => {
    try {
      // Fetch live race calendar from OpenF1 API
      let weekends = await fetchRaceWeekends();

      // Fall back to static data if API fails or returns empty
      if (!weekends || weekends.length === 0) {
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
      }

      setRaceWeekends(weekends);
      setNextRace(findNextRace(weekends as any));
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
      setStandingsUpdatedAt(new Date());
      setStandingsError(null);
    } catch (error) {
      console.error('Error loading standings:', error);
      setDriverStandings([]);
      setConstructorStandings([]);
      setStandingsRound(null);
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
      driverStandings,
      constructorStandings,
      standingsError,
      standingsUpdatedAt,
      standingsRound,
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

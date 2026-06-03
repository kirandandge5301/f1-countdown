import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { RACES as FALLBACK_RACES } from '@/data/races';
import { DRIVERS_STANDINGS as FALLBACK_DRIVERS, CONSTRUCTORS_STANDINGS as FALLBACK_CONSTRUCTORS } from '@/data/standings';
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
  loading: true,
  refresh: () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [raceWeekends, setRaceWeekends] = useState<any[]>([]);
  const [nextRace, setNextRace] = useState<any>(null);
  const [driverStandings, setDriverStandings] = useState<any[]>(FALLBACK_DRIVERS);
  const [constructorStandings, setConstructorStandings] = useState<any[]>(FALLBACK_CONSTRUCTORS);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

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

      // Fetch live championship standings from OpenF1
      const drivers = await fetchEnrichedDriverStandings();
      if (drivers && drivers.length > 0) {
        setDriverStandings(drivers);
      } else {
        setDriverStandings(FALLBACK_DRIVERS);
      }

      const constructors = await fetchEnrichedConstructorStandings();
      if (constructors && constructors.length > 0) {
        setConstructorStandings(constructors);
      } else {
        setConstructorStandings(FALLBACK_CONSTRUCTORS);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setDriverStandings(FALLBACK_DRIVERS);
      setConstructorStandings(FALLBACK_CONSTRUCTORS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = () => loadData();

  return (
    <DataContext.Provider value={{
      raceWeekends,
      nextRace,
      driverStandings,
      constructorStandings,
      loading,
      refresh,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

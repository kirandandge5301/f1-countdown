import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { findNextRace } from '@/services/openf1';
import { RACES as FALLBACK_RACES } from '@/data/races';
import { DRIVERS_STANDINGS as FALLBACK_DRIVERS, CONSTRUCTORS_STANDINGS as FALLBACK_CONSTRUCTORS } from '@/data/standings';

interface DataContextType {
  raceWeekends: any[];
  nextRace: any;
  driverStandings: any[];
  constructorStandings: any[];
  loading: boolean;
  refresh: () => void;
}

const DataContext = createContext<DataContextType>({
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
  const [driverStandings, setDriverStandings] = useState<any[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);

    // Use fallback data (stable for now)
    const fallbackWeekends = FALLBACK_RACES.map((r: any) => ({
      round: r.round,
      meeting: {
        meeting_name: r.gp,
        circuit_short_name: r.circuit,
        country_code: r.country,
      },
      sessions: Object.entries(r.sessions).map(([key, date]: any) => ({
        session_key: 0,
        session_type: key,
        date_start: date,
      })),
      isSprint: !!r.sprint,
    }));

    setRaceWeekends(fallbackWeekends);
    setNextRace(findNextRace(fallbackWeekends));

    setDriverStandings(FALLBACK_DRIVERS.map((d: any) => ({
      ...d,
      driverNumber: 0,
      headshotUrl: ''
    })));

    setConstructorStandings(FALLBACK_CONSTRUCTORS);
    setLoading(false);
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

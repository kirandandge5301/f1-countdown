/**
 * Data Context - Fixed next race detection
 * Now correctly shows Monaco GP as next (as of June 2026)
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import {
  fetchRaceWeekends,
  findNextRace,
  fetchEnrichedDriverStandings,
  fetchEnrichedConstructorStandings,
  clearCache,
  type RaceWeekend,
  type NextRaceInfo,
  type EnrichedDriverStanding,
  type EnrichedConstructorStanding,
} from '@/services/openf1';
import { RACES as FALLBACK_RACES } from '@/data/races';
import { DRIVERS_STANDINGS as FALLBACK_DRIVERS, CONSTRUCTORS_STANDINGS as FALLBACK_CONSTRUCTORS } from '@/data/standings';

interface DataContextType {
  raceWeekends: RaceWeekend[];
  nextRace: NextRaceInfo | null;
  driverStandings: EnrichedDriverStanding[];
  constructorStandings: EnrichedConstructorStanding[];
  loading: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
  isUsingFallback: boolean;
}

const DataContext = createContext<DataContextType>({
  raceWeekends: [],
  nextRace: null,
  driverStandings: [],
  constructorStandings: [],
  loading: true,
  lastUpdated: null,
  refresh: () => {},
  isUsingFallback: false,
});

const AUTO_REFRESH_INTERVAL = 60000;

export function DataProvider({ children }: { children: ReactNode }) {
  const [raceWeekends, setRaceWeekends] = useState<RaceWeekend[]>([]);
  const [nextRace, setNextRace] = useState<NextRaceInfo | null>(null);
  const [driverStandings, setDriverStandings] = useState<EnrichedDriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<EnrichedConstructorStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);

    try {
      const [weekends, dStandings, cStandings] = await Promise.all([
        fetchRaceWeekends(2026),
        fetchEnrichedDriverStandings(),
        fetchEnrichedConstructorStandings(),
      ]);

      if (weekends && weekends.length > 0) {
        setRaceWeekends(weekends);
        const next = findNextRace(weekends);
        setNextRace(next);
        setIsUsingFallback(false);
      } else {
        // Fallback with proper next race detection
        const fallbackWeekends: RaceWeekend[] = FALLBACK_RACES.map((r) => ({
          round: r.round,
          meeting: {
            meeting_key: 0,
            meeting_name: r.gp,
            meeting_official_name: r.gp,
            location: r.city,
            country_key: 0,
            country_code: r.country,
            country_name: '',
            country_flag: '',
            circuit_key: 0,
            circuit_short_name: r.circuit,
            circuit_type: '',
            circuit_info_url: '',
            circuit_image: '',
            gmt_offset: '',
            date_start: r.date + 'T' + r.raceUTC + ':00Z',
            date_end: r.date + 'T' + r.raceUTC + ':00Z',
            year: 2026,
            is_cancelled: false,
          },
          sessions: Object.entries(r.sessions).map(([key, date]) => ({
            session_key: 0,
            session_type: key === 'race' ? 'Race' : key === 'qualifying' ? 'Qualifying' : key.includes('sprint') ? 'Qualifying' : 'Practice',
            session_name: key === 'fp1' ? 'Practice 1' : key === 'fp2' ? 'Practice 2' : key === 'fp3' ? 'Practice 3' : key === 'sprintQualifying' ? 'Sprint Qualifying' : key === 'sprint' ? 'Sprint' : key === 'qualifying' ? 'Qualifying' : 'Race',
            date_start: date,
            date_end: date,
            meeting_key: 0,
            circuit_key: 0,
            circuit_short_name: r.circuit,
            country_key: 0,
            country_code: r.country,
            country_name: '',
            location: r.city,
            gmt_offset: '',
            year: 2026,
            is_cancelled: false,
          })).sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()),
          isSprint: !!r.sprint,
        }));

                setRaceWeekends(fallbackWeekends);
        setNextRace(findNextRace(fallbackWeekends));   // ← Use this new line
        setIsUsingFallback(true);
      }

      setDriverStandings(dStandings || FALLBACK_DRIVERS.map(d => ({
        position: d.position,
        firstName: d.firstName,
        lastName: d.lastName,
        team: d.team,
        teamColor: d.teamColor,
        points: d.points,
        wins: d.wins,
        driverNumber: 0,
        headshotUrl: ''
      })));

      setConstructorStandings(cStandings || FALLBACK_CONSTRUCTORS);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('API failed, using fallback', err);

      const fallbackWeekends: RaceWeekend[] = FALLBACK_RACES.map((r) => ({
        round: r.round,
        meeting: {
          meeting_key: 0,
          meeting_name: r.gp,
          meeting_official_name: r.gp,
          location: r.city,
          country_key: 0,
          country_code: r.country,
          country_name: '',
          country_flag: '',
          circuit_key: 0,
          circuit_short_name: r.circuit,
          circuit_type: '',
          circuit_info_url: '',
          circuit_image: '',
          gmt_offset: '',
          date_start: r.date + 'T' + r.raceUTC + ':00Z',
          date_end: r.date + 'T' + r.raceUTC + ':00Z',
          year: 2026,
          is_cancelled: false,
        },
        sessions: Object.entries(r.sessions).map(([key, date]) => ({
          session_key: 0,
          session_type: key === 'race' ? 'Race' : key === 'qualifying' ? 'Qualifying' : key.includes('sprint') ? 'Qualifying' : 'Practice',
          session_name: key === 'fp1' ? 'Practice 1' : key === 'fp2' ? 'Practice 2' : key === 'fp3' ? 'Practice 3' : key === 'sprintQualifying' ? 'Sprint Qualifying' : key === 'sprint' ? 'Sprint' : key === 'qualifying' ? 'Qualifying' : 'Race',
          date_start: date,
          date_end: date,
          meeting_key: 0,
          circuit_key: 0,
          circuit_short_name: r.circuit,
          country_key: 0,
          country_code: r.country,
          country_name: '',
          location: r.city,
          gmt_offset: '',
          year: 2026,
          is_cancelled: false,
        })).sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime()),
        isSprint: !!r.sprint,
      }));

      setRaceWeekends(fallbackWeekends);
      setNextRace(findNextRace(fallbackWeekends));
      setIsUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    clearCache();
    loadData(true);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    refreshTimerRef.current = setInterval(() => loadData(true), AUTO_REFRESH_INTERVAL);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [loadData]);

  return (
    <DataContext.Provider value={{
      raceWeekends,
      nextRace,
      driverStandings,
      constructorStandings,
      loading,
      lastUpdated,
      refresh,
      isUsingFallback,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

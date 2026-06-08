import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { RACES as FALLBACK_RACES } from '@/data/races';
import { DRIVERS_STANDINGS as FALLBACK_DRIVERS, CONSTRUCTORS_STANDINGS as FALLBACK_CONSTRUCTORS } from '@/data/standings';
import {
  findNextRace,
  fetchRaceWeekends,
  fetchEnrichedDriverStandings,
  fetchEnrichedConstructorStandings,
  type EnrichedConstructorStanding,
  type EnrichedDriverStanding,
  type NextRaceInfo,
  type RaceWeekend,
  type Session,
} from '@/services/openf1';
import { deriveRaceWeekExperience, findPreviousRaceWeekend, type RaceWeekExperience } from '@/services/raceExperience';
import { fetchPreviousRaceRecap } from '@/services/recap';
import type { PreviousRaceRecap } from '@/data/raceRecaps';
import { useTimezone } from '@/context/TimezoneContext';

interface DataContextType {
  raceWeekends: RaceWeekend[];
  nextRace: NextRaceInfo | null;
  previousRace: RaceWeekend | null;
  raceWeekExperience: RaceWeekExperience | null;
  previousRaceRecap: PreviousRaceRecap | null;
  driverStandings: EnrichedDriverStanding[];
  constructorStandings: EnrichedConstructorStanding[];
  loading: boolean;
  raceLoading: boolean;
  recapLoading: boolean;
  standingsLoading: boolean;
  hasLiveRaceData: boolean;
  hasLiveStandings: boolean;
  refresh: () => void;
}

const createFallbackWeekends = (): RaceWeekend[] =>
  FALLBACK_RACES.map((race) => ({
    round: race.round,
    meeting: {
      meeting_key: race.round,
      meeting_name: race.gp,
      meeting_official_name: race.gp,
      location: race.city,
      country_key: race.round,
      country_code: race.country,
      country_name: race.country,
      country_flag: '',
      circuit_key: race.round,
      circuit_short_name: race.circuit,
      circuit_type: 'race',
      circuit_info_url: '',
      circuit_image: '',
      gmt_offset: '+00:00:00',
      date_start: race.sessions.race,
      date_end: race.sessions.race,
      year: 2026,
      is_cancelled: false,
    },
    sessions: Object.entries(race.sessions || {}).map(([key, date], index) => ({
      session_key: race.round * 100 + index,
      session_type: key,
      session_name: key,
      date_start: date,
      date_end: date,
      meeting_key: race.round,
      circuit_key: race.round,
      circuit_short_name: race.circuit,
      country_key: race.round,
      country_code: race.country,
      country_name: race.country,
      location: race.city,
      gmt_offset: '+00:00:00',
      year: 2026,
      is_cancelled: false,
    })) as Session[],
    isSprint: !!race.sprint,
  }));

const DataContext = createContext<DataContextType>({
  raceWeekends: [],
  nextRace: null,
  previousRace: null,
  raceWeekExperience: null,
  previousRaceRecap: null,
  driverStandings: FALLBACK_DRIVERS.map((driver) => ({
    ...driver,
    driverNumber: 0,
    headshotUrl: '',
  })),
  constructorStandings: FALLBACK_CONSTRUCTORS.map((team) => ({
    ...team,
    teamSecondaryColor: '#141414',
    logoText: team.name.slice(0, 3).toUpperCase(),
    base: 'Team',
  })),
  loading: true,
  raceLoading: true,
  recapLoading: true,
  standingsLoading: true,
  hasLiveRaceData: false,
  hasLiveStandings: false,
  refresh: () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const { timezone } = useTimezone();
  const [raceWeekends, setRaceWeekends] = useState<RaceWeekend[]>([]);
  const [nextRace, setNextRace] = useState<NextRaceInfo | null>(null);
  const [previousRace, setPreviousRace] = useState<RaceWeekend | null>(null);
  const [raceWeekExperience, setRaceWeekExperience] = useState<RaceWeekExperience | null>(null);
  const [previousRaceRecap, setPreviousRaceRecap] = useState<PreviousRaceRecap | null>(null);
  const [driverStandings, setDriverStandings] = useState<EnrichedDriverStanding[]>(
    FALLBACK_DRIVERS.map((driver) => ({
      ...driver,
      driverNumber: 0,
      headshotUrl: '',
    })),
  );
  const [constructorStandings, setConstructorStandings] = useState<EnrichedConstructorStanding[]>(
    FALLBACK_CONSTRUCTORS.map((team) => ({
      ...team,
      teamSecondaryColor: '#141414',
      logoText: team.name.slice(0, 3).toUpperCase(),
      base: 'Team',
    })),
  );
  const [loading, setLoading] = useState(true);
  const [raceLoading, setRaceLoading] = useState(true);
  const [recapLoading, setRecapLoading] = useState(true);
  const [standingsLoading, setStandingsLoading] = useState(true);
  const [hasLiveRaceData, setHasLiveRaceData] = useState(false);
  const [hasLiveStandings, setHasLiveStandings] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setRaceLoading(true);
    setRecapLoading(true);
    setStandingsLoading(true);

    try {
      let weekends = await fetchRaceWeekends();
      const liveRaceData = weekends && weekends.length > 0;

      if (!liveRaceData) {
        console.warn('OpenF1 API returned no races, using fallback calendar');
        weekends = createFallbackWeekends();
      }

      setHasLiveRaceData(liveRaceData);
      setRaceWeekends(weekends);
      const nextRaceInfo = findNextRace(weekends);
      const previousRaceInfo = findPreviousRaceWeekend(weekends, nextRaceInfo);

      setNextRace(nextRaceInfo);
      setPreviousRace(previousRaceInfo);
      setRaceWeekExperience(deriveRaceWeekExperience(nextRaceInfo, timezone));
      setRaceLoading(false);

      const [recapResult, driversResult, constructorsResult] = await Promise.allSettled([
        fetchPreviousRaceRecap(previousRaceInfo?.meeting.meeting_name),
        fetchEnrichedDriverStandings(),
        fetchEnrichedConstructorStandings(),
      ]);

      const recap = recapResult.status === 'fulfilled' ? recapResult.value : null;
      setPreviousRaceRecap(recap);
      setRecapLoading(false);

      const drivers = driversResult.status === 'fulfilled' ? driversResult.value : [];
      const constructors = constructorsResult.status === 'fulfilled' ? constructorsResult.value : [];
      const liveStandings = drivers.length > 0 && constructors.length > 0;

      setHasLiveStandings(liveStandings);

      if (drivers && drivers.length > 0) {
        setDriverStandings(drivers);
      } else {
        setDriverStandings(
          FALLBACK_DRIVERS.map((driver) => ({
            ...driver,
            driverNumber: 0,
            headshotUrl: '',
          })),
        );
      }

      if (constructors && constructors.length > 0) {
        setConstructorStandings(constructors);
      } else {
        setConstructorStandings(
          FALLBACK_CONSTRUCTORS.map((team) => ({
            ...team,
            teamSecondaryColor: '#141414',
            logoText: team.name.slice(0, 3).toUpperCase(),
            base: 'Team',
          })),
        );
      }
      setStandingsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      const weekends = createFallbackWeekends();
      const nextRaceInfo = findNextRace(weekends);
      const previousRaceInfo = findPreviousRaceWeekend(weekends, nextRaceInfo);

      setHasLiveRaceData(false);
      setHasLiveStandings(false);
      setRaceWeekends(weekends);
      setNextRace(nextRaceInfo);
      setPreviousRace(previousRaceInfo);
      setRaceWeekExperience(deriveRaceWeekExperience(nextRaceInfo, timezone));
      setRaceLoading(false);
      setPreviousRaceRecap(previousRaceInfo ? await fetchPreviousRaceRecap(previousRaceInfo.meeting.meeting_name) : null);
      setRecapLoading(false);
      setDriverStandings(
        FALLBACK_DRIVERS.map((driver) => ({
          ...driver,
          driverNumber: 0,
          headshotUrl: '',
        })),
      );
      setConstructorStandings(
        FALLBACK_CONSTRUCTORS.map((team) => ({
          ...team,
          teamSecondaryColor: '#141414',
          logoText: team.name.slice(0, 3).toUpperCase(),
          base: 'Team',
        })),
      );
      setStandingsLoading(false);
    } finally {
      setLoading(false);
    }
  }, [timezone]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setRaceWeekExperience(deriveRaceWeekExperience(nextRace, timezone));
  }, [nextRace, timezone]);

  const refresh = () => loadData();

  return (
    <DataContext.Provider value={{
      raceWeekends,
      nextRace,
      previousRace,
      raceWeekExperience,
      previousRaceRecap,
      driverStandings,
      constructorStandings,
      loading,
      raceLoading,
      recapLoading,
      standingsLoading,
      hasLiveRaceData,
      hasLiveStandings,
      refresh,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

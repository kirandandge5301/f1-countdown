import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { RACES as FALLBACK_RACES } from '@/data/races';
import {
  findNextRace,
  fetchPreferredRaceWeekends,
  fetchEnrichedDriverStandings,
  fetchEnrichedConstructorStandings,
  type EnrichedConstructorStanding,
  type EnrichedDriverStanding,
  type NextRaceInfo,
  type PreferredRaceWeekendsResult,
  type RaceWeekend,
  type Session,
  type Meeting,
  VERIFIED_FALLBACK_YEAR,
} from '@/services/openf1';
import { deriveRaceWeekExperience, findPreviousRaceWeekend, type RaceWeekExperience } from '@/services/raceExperience';
import { fetchPreviousRaceRecap } from '@/services/recap';
import type { PreviousRaceRecap } from '@/data/raceRecaps';
import { useTimezone } from '@/context/TimezoneContext';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface DataContextType {
  raceWeekends: RaceWeekend[];
  nextRace: NextRaceInfo | null;
  previousRace: RaceWeekend | null;
  raceWeekExperience: RaceWeekExperience | null;
  previousRaceRecap: PreviousRaceRecap | null;
  driverStandings: EnrichedDriverStanding[];
  constructorStandings: EnrichedConstructorStanding[];
  seasonYear: number;
  totalRounds: number;
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
      meeting_official_name: race.officialName || race.gp,
      location: race.city,
      country_key: race.round,
      country_code: race.country,
      country_name: race.countryName || race.country,
      country_flag: '',
      circuit_key: race.round,
      circuit_short_name: race.circuit,
      circuit_type: 'race',
      circuit_info_url: '',
      circuit_image: '',
      gmt_offset: '+00:00:00',
      date_start: race.sessions.race,
      date_end: race.sessions.race,
      year: VERIFIED_FALLBACK_YEAR,
      is_cancelled: false,
    } as Meeting,
    sessions: Object.entries(race.sessions || {}).map(([key, date], index) => ({
      session_key: race.round * 100 + index,
      session_type: key === 'qualifying' || key === 'sprintQualifying' ? 'Qualifying' : key === 'sprint' || key === 'race' ? 'Race' : 'Practice',
      session_name:
        key === 'fp1' ? 'Practice 1' :
        key === 'fp2' ? 'Practice 2' :
        key === 'fp3' ? 'Practice 3' :
        key === 'sprintQualifying' ? 'Sprint Qualifying' :
        key === 'sprint' ? 'Sprint' :
        key === 'qualifying' ? 'Qualifying' :
        'Race',
      date_start: date,
      date_end: date,
      meeting_key: race.round,
      circuit_key: race.round,
      circuit_short_name: race.circuit,
      country_key: race.round,
      country_code: race.country,
      country_name: race.countryName || race.country,
      location: race.city,
      gmt_offset: '+00:00:00',
      year: VERIFIED_FALLBACK_YEAR,
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
  driverStandings: [],
  constructorStandings: [],
  seasonYear: VERIFIED_FALLBACK_YEAR,
  totalRounds: 0,
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
  const [driverStandings, setDriverStandings] = useState<EnrichedDriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<EnrichedConstructorStanding[]>([]);
  const [seasonYear, setSeasonYear] = useState<number>(VERIFIED_FALLBACK_YEAR);
  const [totalRounds, setTotalRounds] = useState<number>(0);
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
      const preferredRaceData: PreferredRaceWeekendsResult = await fetchPreferredRaceWeekends();
      let weekends = preferredRaceData.weekends;
      const liveRaceData = preferredRaceData.isLiveSeason && weekends.length > 0;

      if (weekends.length === 0) {
        console.warn('OpenF1 API returned no active season data, using verified local season archive');
        weekends = createFallbackWeekends();
        setSeasonYear(VERIFIED_FALLBACK_YEAR);
      } else {
        setSeasonYear(preferredRaceData.seasonYear);
      }

      setHasLiveRaceData(liveRaceData);
      setRaceWeekends(weekends);
      setTotalRounds(weekends.length);
      const nextRaceInfo = findNextRace(weekends);
      const previousRaceInfo = findPreviousRaceWeekend(weekends, nextRaceInfo);

      setNextRace(nextRaceInfo);
      setPreviousRace(previousRaceInfo);
      setRaceWeekExperience(deriveRaceWeekExperience(nextRaceInfo, previousRaceInfo, timezone));
      setRaceLoading(false);

      const recapPromise = fetchPreviousRaceRecap({
        seasonYear: weekends[0]?.meeting.year || preferredRaceData.seasonYear || VERIFIED_FALLBACK_YEAR,
        raceName: previousRaceInfo?.meeting.meeting_name,
        round: previousRaceInfo?.round,
      });

      const recap = await recapPromise.catch(() => null);
      setPreviousRaceRecap(recap);
      setRecapLoading(false);

      const drivers = await fetchEnrichedDriverStandings().catch(() => []);
      await wait(450);
      const constructors = await fetchEnrichedConstructorStandings().catch(() => []);
      const liveStandings = drivers.length > 0 && constructors.length > 0;

      setHasLiveStandings(liveStandings);

      if (drivers && drivers.length > 0) {
        setDriverStandings(drivers);
      } else {
        setDriverStandings([]);
      }

      if (constructors && constructors.length > 0) {
        setConstructorStandings(constructors);
      } else {
        setConstructorStandings([]);
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
      setSeasonYear(VERIFIED_FALLBACK_YEAR);
      setTotalRounds(weekends.length);
      setNextRace(nextRaceInfo);
      setPreviousRace(previousRaceInfo);
      setRaceWeekExperience(deriveRaceWeekExperience(nextRaceInfo, previousRaceInfo, timezone));
      setRaceLoading(false);
      setPreviousRaceRecap(previousRaceInfo ? await fetchPreviousRaceRecap({ seasonYear: VERIFIED_FALLBACK_YEAR, raceName: previousRaceInfo.meeting.meeting_name, round: previousRaceInfo.round }) : null);
      setRecapLoading(false);
      setDriverStandings([]);
      setConstructorStandings([]);
      setStandingsLoading(false);
    } finally {
      setLoading(false);
    }
  }, [timezone]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setRaceWeekExperience(deriveRaceWeekExperience(nextRace, previousRace, timezone));
  }, [nextRace, previousRace, timezone]);

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
      seasonYear,
      totalRounds,
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

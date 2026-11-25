import { useEffect, useState } from 'react';
import { useData } from '@/context/DataContext';
import { useSiteNow } from '@/features/playlist/useSiteNow';
import { sessionEndTime, type RaceWeekend } from '@/services/openf1';
import { fetchQualifying, fetchSeasonPoles, type QualifyingRow, type SeasonFastest } from '@/services/qualifying';

const HOUR = 3600_000;
const RETRY_MS = 5 * 60_000;

export interface QualifyingResult {
  weekend: RaceWeekend;
  season: number;
  rows: QualifyingRow[];
  seasonList: SeasonFastest[] | null;
}

/** The weekend between the end of Qualifying and race start + 3 h, if there is one. Pure. */
export function qualifyingWindow(weekends: RaceWeekend[], now: Date): RaceWeekend | null {
  const t = now.getTime();
  return weekends.find(w => {
    const quali = w.sessions.find(s => s.session_name === 'Qualifying');
    if (!quali || w.meeting.is_cancelled) return false;
    const race = w.sessions.find(s => s.session_name === 'Race');
    const until = race ? new Date(race.date_start).getTime() + 3 * HOUR : new Date(w.meeting.date_end).getTime();
    return sessionEndTime(quali) <= t && t < until;
  }) ?? null;
}

/** Qualifying, once Jolpica has published it; asks again every 5 minutes until then. */
export function useQualifying(): QualifyingResult | null {
  const { raceWeekends, activeSeason } = useData();
  const weekend = qualifyingWindow(raceWeekends, useSiteNow());
  const round = weekend?.round ?? null;
  const [result, setResult] = useState<Omit<QualifyingResult, 'weekend'> & { round: number } | null>(null);

  useEffect(() => {
    if (round === null) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let current = true;
    const check = async () => {
      const rows = await fetchQualifying(activeSeason, round);
      if (!current) return;
      if (!rows || rows.length === 0) {
        timer = setTimeout(check, RETRY_MS);
        return;
      }
      const seasonList = await fetchSeasonPoles(activeSeason);
      if (current) setResult({ season: activeSeason, round, rows, seasonList });
    };
    void check();
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [round, activeSeason]);

  if (!weekend || result?.round !== round || result.season !== activeSeason) return null;
  return { weekend, season: result.season, rows: result.rows, seasonList: result.seasonList };
}

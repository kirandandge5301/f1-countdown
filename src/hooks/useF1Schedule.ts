import { useEffect, useState } from 'react';
import { fetchCurrentSchedule, convertRace } from '../f1api';

export function useF1Schedule() {
  const [races, setRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentSchedule()
      .then(data => {
        const apiRaces = data.MRData.RaceTable.Races;
        const converted = apiRaces.map(convertRace);

        setRaces(converted);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  return { races, loading };
}

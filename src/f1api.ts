export async function fetchCurrentSchedule() {
  const response = await fetch(
    'https://api.jolpi.ca/ergast/f1/current/races.json'
  );

  if (!response.ok) {
    throw new Error('Failed to fetch schedule');
  }

  return response.json();
}

export async function fetchDriverStandings() {
  const response = await fetch(
    'https://api.jolpi.ca/ergast/f1/current/driverstandings.json'
  );

  if (!response.ok) {
    throw new Error('Failed to fetch driver standings');
  }

  return response.json();
}

export async function fetchConstructorStandings() {
  const response = await fetch(
    'https://api.jolpi.ca/ergast/f1/current/constructorstandings.json'
  );

  if (!response.ok) {
    throw new Error('Failed to fetch constructor standings');
  }

  return response.json();
}
export function convertRace(apiRace: any) {
  return {
    round: Number(apiRace.round),
    date: apiRace.date,
    day: '',
    gp: apiRace.raceName,
    circuit: apiRace.Circuit?.circuitName || '',
    country: apiRace.Circuit?.Location?.country || '',
    city: apiRace.Circuit?.Location?.locality || '',
    sprint: !!apiRace.Sprint,

    raceUTC: `${apiRace.date}T${apiRace.time || '00:00:00Z'}`,

    sessions: {
      fp1: apiRace.FirstPractice
        ? `${apiRace.FirstPractice.date}T${apiRace.FirstPractice.time}`
        : undefined,

      fp2: apiRace.SecondPractice
        ? `${apiRace.SecondPractice.date}T${apiRace.SecondPractice.time}`
        : undefined,

      fp3: apiRace.ThirdPractice
        ? `${apiRace.ThirdPractice.date}T${apiRace.ThirdPractice.time}`
        : undefined,

      qualifying: apiRace.Qualifying
        ? `${apiRace.Qualifying.date}T${apiRace.Qualifying.time}`
        : undefined,

      race: `${apiRace.date}T${apiRace.time || '00:00:00Z'}`
    }
  };
}

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

import { RACES, SESSION_ORDER, SESSION_LABELS } from './races';
import type { Race } from './races';

export interface NextSessionInfo {
  race: Race;
  sessionKey: string;
  sessionLabel: string;
  sessionTime: string;
  isNextSession: boolean;
}

export function findNextRaceAndSession(): { race: Race; nextSession: NextSessionInfo | null; allSessions: NextSessionInfo[] } {
  const now = new Date();

  for (const race of RACES) {
    const sessions: NextSessionInfo[] = [];
    let foundNext = false;

    for (const key of SESSION_ORDER) {
      const time = race.sessions[key];
      if (!time) continue;

      const sessionDate = new Date(time);
      const isNextSession = !foundNext && sessionDate > now;

      sessions.push({
        race,
        sessionKey: key,
        sessionLabel: SESSION_LABELS[key] || key,
        sessionTime: time,
        isNextSession
      });

      if (isNextSession) {
        foundNext = true;
      }
    }

    if (foundNext) {
      const nextSession = sessions.find(s => s.isNextSession) || null;
      return { race, nextSession, allSessions: sessions };
    }

    // Check if any session in this race is still upcoming
    const hasUpcoming = sessions.some(s => new Date(s.sessionTime) > now);
    if (hasUpcoming) {
      const nextSession = sessions.find(s => new Date(s.sessionTime) > now) || null;
      return { race, nextSession, allSessions: sessions };
    }
  }

  // If all races are past, return the last race
  const lastRace = RACES[RACES.length - 1];
  const sessions: NextSessionInfo[] = SESSION_ORDER.map(key => {
    const time = lastRace.sessions[key];
    return {
      race: lastRace,
      sessionKey: key,
      sessionLabel: SESSION_LABELS[key] || key,
      sessionTime: time || '',
      isNextSession: false
    };
  }).filter(s => s.sessionTime);

  return { race: lastRace, nextSession: null, allSessions: sessions };
}

export function findNextRace(): Race | null {
  const { race } = findNextRaceAndSession();
  return race;
}

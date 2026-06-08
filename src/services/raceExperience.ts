import { getSessionDisplayName, type NextRaceInfo, type RaceWeekend, type Session } from '@/services/openf1';

export type RaceWeekPhase = 'RACE_WEEK' | 'PRACTICE_DAY' | 'SPRINT_DAY' | 'QUALIFYING_DAY' | 'RACE_DAY' | 'WEEKEND_COMPLETE';

export interface RaceWeekExperience {
  phase: RaceWeekPhase;
  label: string;
  primaryCopy: string;
  secondaryCopy: string;
  nextMoment: string;
}

function getZonedDateKey(input: Date | string, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(new Date(input));
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

function getMeetingShortName(race: RaceWeekend): string {
  return race.meeting.meeting_name.replace(' Grand Prix', '').toUpperCase();
}

function getSessionKind(session: Session): 'practice' | 'sprint' | 'qualifying' | 'race' | 'other' {
  const display = getSessionDisplayName(session).toLowerCase();

  if (display === 'race') return 'race';
  if (display.includes('sprint')) return 'sprint';
  if (display.includes('qualifying')) return 'qualifying';
  if (display.includes('practice')) return 'practice';

  return 'other';
}

function getTodayPhase(sessions: Session[], timezone: string): RaceWeekPhase | null {
  const todayKey = getZonedDateKey(new Date(), timezone);
  const sessionsToday = sessions.filter((session) => getZonedDateKey(session.date_start, timezone) === todayKey);

  if (sessionsToday.some((session) => getSessionKind(session) === 'race')) return 'RACE_DAY';
  if (sessionsToday.some((session) => getSessionKind(session) === 'sprint')) return 'SPRINT_DAY';
  if (sessionsToday.some((session) => getSessionKind(session) === 'qualifying')) return 'QUALIFYING_DAY';
  if (sessionsToday.some((session) => getSessionKind(session) === 'practice')) return 'PRACTICE_DAY';

  return null;
}

function wasWeekendCompletedRecently(previousRace: RaceWeekend | null): boolean {
  if (!previousRace?.sessions.length) return false;

  const finalSession = [...previousRace.sessions].sort(
    (a, b) => new Date(b.date_end || b.date_start).getTime() - new Date(a.date_end || a.date_start).getTime(),
  )[0];

  const endTime = new Date(finalSession.date_end || finalSession.date_start).getTime();
  const hoursSince = (Date.now() - endTime) / (1000 * 60 * 60);

  return hoursSince >= 0 && hoursSince <= 18;
}

function getCopyForPhase(phase: RaceWeekPhase, race: RaceWeekend): Pick<RaceWeekExperience, 'label' | 'primaryCopy' | 'secondaryCopy'> {
  const meetingName = race.meeting.meeting_name;
  const shortName = getMeetingShortName(race);
  const circuit = race.meeting.circuit_short_name;
  const location = race.meeting.location || race.meeting.country_name;

  if (meetingName === 'Monaco Grand Prix') {
    if (phase === 'RACE_WEEK') {
      return {
        label: `${shortName} RACE WEEK`,
        primaryCopy: 'The streets of Monte Carlo are ready.',
        secondaryCopy: 'Every braking zone feels tighter when the walls are this close.',
      };
    }

    if (phase === 'QUALIFYING_DAY') {
      return {
        label: 'QUALIFYING DAY',
        primaryCopy: 'Qualifying at Monaco can decide the race.',
        secondaryCopy: 'One perfect lap can own the harbour for the rest of the weekend.',
      };
    }
  }

  const phaseCopy: Record<RaceWeekPhase, Pick<RaceWeekExperience, 'label' | 'primaryCopy' | 'secondaryCopy'>> = {
    RACE_WEEK: {
      label: `${shortName} RACE WEEK`,
      primaryCopy: `${location} is beginning to build toward race weekend.`,
      secondaryCopy: `${circuit} is next on the calendar, and the first real clues are almost here.`,
    },
    PRACTICE_DAY: {
      label: 'CARS ON TRACK TODAY',
      primaryCopy: `${circuit} is open and the weekend is finally breathing for real.`,
      secondaryCopy: 'Long runs, setup swings, and the first honest pace clues are about to hit the timing screens.',
    },
    SPRINT_DAY: {
      label: 'SPRINT DAY',
      primaryCopy: 'No room to ease in now — sprint points and grid pressure arrive together.',
      secondaryCopy: 'A short-format Saturday can flip the mood of an entire weekend before sunset.',
    },
    QUALIFYING_DAY: {
      label: 'QUALIFYING DAY',
      primaryCopy: 'Track position is about to become everything.',
      secondaryCopy: 'The margins shrink, the kerbs get louder, and one clean lap can rewrite the story.',
    },
    RACE_DAY: {
      label: 'LIGHTS OUT TODAY',
      primaryCopy: 'Lights out is only hours away.',
      secondaryCopy: 'Now the strategy calls, tyre life, and first-lap nerve really start to matter.',
    },
    WEEKEND_COMPLETE: {
      label: 'RACE WEEKEND COMPLETE',
      primaryCopy: `${location} has had its say and the points are in the books.`,
      secondaryCopy: 'Now the paddock resets, the stories settle, and the next weekend starts to take shape.',
    },
  };

  return phaseCopy[phase];
}

export function findPreviousRaceWeekend(weekends: RaceWeekend[], nextRace: NextRaceInfo | null): RaceWeekend | null {
  if (!weekends.length) return null;

  if (!nextRace) {
    return weekends[weekends.length - 1] || null;
  }

  const nextRaceIndex = weekends.findIndex(
    (weekend) => weekend.meeting.meeting_key === nextRace.race.meeting.meeting_key,
  );

  return nextRaceIndex > 0 ? weekends[nextRaceIndex - 1] : null;
}

export function deriveRaceWeekExperience(nextRace: NextRaceInfo | null, previousRace: RaceWeekend | null, timezone: string): RaceWeekExperience | null {
  if (!nextRace && !previousRace) return null;

  if (previousRace && wasWeekendCompletedRecently(previousRace)) {
    const copy = getCopyForPhase('WEEKEND_COMPLETE', previousRace);

    return {
      phase: 'WEEKEND_COMPLETE',
      label: copy.label,
      primaryCopy: copy.primaryCopy,
      secondaryCopy: copy.secondaryCopy,
      nextMoment: nextRace ? `Next up: ${nextRace.race.meeting.meeting_name}` : 'The next round will appear as soon as the calendar updates.',
    };
  }

  if (!nextRace) return null;

  const todayPhase = getTodayPhase(nextRace.allSessions, timezone);
  const phase = todayPhase || 'RACE_WEEK';
  const copy = getCopyForPhase(phase, nextRace.race);
  const nextMoment = nextRace.nextSession
    ? `Next up: ${getSessionDisplayName(nextRace.nextSession)}`
    : 'This weekend is complete — the next lights-out is already in sight.';

  return {
    phase,
    label: copy.label,
    primaryCopy: copy.primaryCopy,
    secondaryCopy: copy.secondaryCopy,
    nextMoment,
  };
}

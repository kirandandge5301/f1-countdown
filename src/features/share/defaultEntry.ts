/** Card Studio helpers. Pure. */
import type { Week } from '@/features/playlist/content';
import { raceMoment, raceWeekStart } from '@/features/playlist/playlistState';
import type { RaceWeekend } from '@/services/openf1';

const DAY = 24 * 3600_000;
const IST_OFFSET = 5.5 * 3600_000;

/** "2026-11-30T05:00:00+05:30" */
export function istIso(at: number): string {
  return `${new Date(at + IST_OFFSET).toISOString().slice(0, 19)}+05:30`;
}

/** An entry with the default times: tracks Monday-Thursday 05:00 IST, drop Friday 05:00 IST. */
export function defaultEntry(weekend: RaceWeekend, season: number): Week {
  const start = raceWeekStart(raceMoment(weekend).start);
  return {
    id: `${season}-r${weekend.round}`,
    kind: 'race', season, round: weekend.round,
    startsAt: istIso(start), endsAt: istIso(start + 7 * DAY),
    layout: 'N8',
    playlist: {
      title: `${weekend.meeting.meeting_name.replace(/ Grand Prix$/, '')} race week`.slice(0, 60),
      links: {},
      dropAt: istIso(start + 4 * DAY),
      tracks: [0, 1, 2, 3].map(d => ({ title: 'REPLACE ME', artist: 'REPLACE ME', revealAt: istIso(start + d * DAY) })),
    },
  };
}

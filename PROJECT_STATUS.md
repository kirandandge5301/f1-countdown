# Project Status

_Last updated: 2026-11-25 · all work merged to `main`_

## Done

- **Jolpica wins when the two services disagree on a session time** - merged
  - If OpenF1 puts a session more than 1 hour away from Jolpica's time for the same
    session, Jolpica's start is used (the session keeps its OpenF1 length). Only the
    2026 Miami race differed (OpenF1 17:00, Jolpica 20:00); it now shows 20:00.
  - File: `src/services/openf1.ts` (`preferJolpicaTimes`).
- **Calendar and live-state batch (7 stacked branches, not merged)**
  - **Jolpica is the calendar source** (`3decf76`): race list, names, rounds, dates and
    cancellations come from Jolpica; OpenF1 adds session times, matched by start time
    (never by name). Where OpenF1 has no sessions for a weekend, Jolpica's own schedule
    is used and the hero says times are confirmed closer to the date. Jolpica's names
    fix Brazil's missing circuit insights, and the Sepang race no longer shows Bahrain's facts.
  - **Cancelled sessions** (`ddc6f52`): skipped everywhere; removed the unused
    `fetchSessionsForMeeting` that did not filter them.
  - **"After Round N"** (`597f546`): capped at the last race that has really finished
    (Jolpica reports round N once qualifying is in, with round N-1 points).
  - **LIVE state** (`6bad8eb`): while a session is under way the hero says "LIVE NOW" and
    the session, with "Next: ... in ..."; no more skipping ahead or 00:00:00:00.
  - **The page updates itself** (`22a9e1b`): the hero changes when a session starts or ends,
    the next season loads in the background after the final race, and data refreshes every
    15 min and when the tab returns. A failed background refresh keeps data on screen.
  - **Last known calendar** (`00a2bfb`): every good load is saved in the browser; if a load
    fails the page shows it labelled "as of <time>" with Retry (max 30 days old, season
    not over). With nothing usable: the error card.
  - **Team colours** (`953e800`): own documented file `src/data/teamColors.ts`; an unknown
    team gets a grey ring and a console warning.
  - Files: `src/services/openf1.ts`, `src/services/calendarCache.ts` (new),
    `src/context/DataContext.tsx`, `src/data/teamColors.ts` (new),
    `src/components/StaleCalendarNotice.tsx` (new), `SessionCard.tsx`,
    `ExpandableRaceCard.tsx`, `NextRaceSection.tsx`, `ScheduleSection.tsx`.
- **How to watch badges fixed** - merged
  - The two default cards showed raw escape text (\u00b7) instead of a dot, because
    JSX string attributes do not process JS escapes. Now a real "·":
    "WORLDWIDE · OFFICIAL", "UNITED KINGDOM · IRELAND".
  - File: `src/sections/HowToWatchSection.tsx`.
- **Driver photos removed** - `fix/remove-driver-photos`, `496d1df`
  - Standings no longer hotlink official F1 headshots (design rule: no driver photos).
    The Drivers tab shows the car number (initials if none) in a team-colour ring.
  - The OpenF1 `/drivers` request, `fetchDrivers`, `DriverInfo` and `headshotUrl` are
    gone: standings come entirely from Jolpica; OpenF1 is only used for the calendar
    and session times.
  - Files: `src/sections/StandingsSection.tsx`, `src/services/openf1.ts`.
  - `CLAUDE.md` data rule updated: OpenF1 is for session times only.
- **Time zone fallback** - `fix/timezone-fallback`, `c83eddb`
  - If the browser can't report its zone, the site now falls back to GMT (neutral),
    not India. Before: a failed lookup showed India times as the visitor's own, an
    empty result crashed the page, an invalid id showed "--:--".
  - Only a valid zone is accepted; a corrupted saved choice is ignored.
  - Files: `src/data/timezones.ts`, `src/context/TimezoneContext.tsx`.
- **Time zone display (step 4/5)** - merged
  - Race cards showed the first practice time as the race time (code looked for
    session type `'race'`, OpenF1 uses `'Race'`). Now uses the session named "Race";
    if no start time is published the card shows "TBC" plus the race date.
  - Session rows use the selected time zone (were hard-coded UTC).
  - Labels use the picker's names ("India", not "Calcutta"); old zone ids such as
    `Asia/Calcutta` map to the picker's; no wrong default label on first paint.
  - Each card's offset label uses that race's date (daylight saving).
  - Picker also lists the visitor's own zone (and the active one) if missing.
  - Files: `src/data/timezones.ts`, `src/context/TimezoneContext.tsx`,
    `src/components/ExpandableRaceCard.tsx`, `src/components/Header.tsx`,
    `src/sections/ScheduleSection.tsx`.
- **Unused code deleted** - merged
  - Removed 5 files nothing imported: `src/f1api.ts`, `src/hooks/useF1Schedule.ts`,
    `src/data/standings.ts`, `src/data/races.ts` (hard-coded 2026 calendar) and
    `src/data/raceLogic.ts` (old next-race logic that only used `races.ts`).
    Build passes. Restorable from git history if ever needed.
- **Static fallback removed (step 3/5)** - merged in `4ef06b8`
  - If the calendar can't be loaded, the hero and schedule show an error card with
    Retry ("Couldn't load the race calendar right now."). The hard-coded `races.ts`
    calendar is no longer used anywhere; old data is cleared, never shown as live.
  - Retry reloads only the calendar (standings and calendar retry separately).
  - OpenF1 meetings/sessions now return `null` on failure (not `[]`) and failures are
    never cached, so Retry gets fresh data.
  - "calendar coming soon" only when both APIs answered; OpenF1 down reads as an error.
  - Files: `src/services/openf1.ts`, `src/context/DataContext.tsx`,
    `src/sections/NextRaceSection.tsx`, `src/sections/ScheduleSection.tsx`, new
    `src/components/CalendarErrorCard.tsx`.
- **Season rollover (step 2/5)** - merged in `0fb7fad`
  - No year typed in code: `getActiveSeason` shows this year while a race is
    unfinished, otherwise next year. Header, schedule heading and footer follow it.
  - Off-season hero: next season's first race weekend (OpenF1); if only Jolpica has
    dates, a race-start countdown labelled "times confirmed closer to the date" (date
    only, no countdown, if Jolpica has no time); if neither has a calendar, the card
    "<year> season complete · <next year> calendar coming soon".
  - Standings: before round 1 of a new season, the previous season's final table,
    labelled "Final <year> standings" (not an error).
  - OpenF1 requests retry briefly on HTTP 429 (rate limit). Meetings without sessions
    no longer count as a loaded calendar.
  - (`races.ts` guard added here was superseded: the fallback is gone in step 3.)
- **Round numbers (step 1/5)** - merged in `da119aa`
  - Cancelled meetings (`is_cancelled`, e.g. Bahrain and Saudi Arabia 2026) are dropped
    at load, so they never reach the hero, schedule or next-race logic.
  - Rounds come from the Jolpica calendar, matched by race start time (within 24 h;
    or last day vs race date within 2 days if no Race session yet). Never by name.
  - If Jolpica fails or any weekend can't be matched, ALL weekends use sequential
    numbering by date, with one console warning (never a mix of the two).
  - "/ 24" and "24 ROUNDS" replaced by `totalRounds` (Jolpica count, else weekend count).
  - Season year constant `SEASON_YEAR` (removed again in step 2).
  - Files: `src/services/openf1.ts`, `src/context/DataContext.tsx`,
    `src/sections/NextRaceSection.tsx`, `src/sections/ScheduleSection.tsx`.
- **Standings on Jolpica** (`ab77165`): live points and wins, "Last updated" line,
  honest error card. Retry reloads standings only.
- **India broadcaster** (`6534024`): secondary card is now FanCode.

## Still open

- **Decision for you: OpenF1 as a fallback calendar.** Jolpica is now the source of the
  race list. Only when Jolpica has no calendar for a season (2027 today, until Jolpica
  publishes it) or is down, the page falls back to OpenF1's own list, with rounds numbered
  by date. This keeps the off-season countdown working, but it is an exception to
  "OpenF1 is for session times only". Removing the fallback means the page says
  "2027 calendar coming soon" until Jolpica has the season.
- **Missing circuit facts / insights:** no insights for Barcelona, Las Vegas, Qatar and
  "Bahrain Grand Prix in Malaysia"; the circuit fact box exists for only 6 races
  (`src/data/circuitInfo.ts`, `src/data/gp-insights.ts`, keyed by Jolpica race name).
- **"After Round N" just after a race:** capped to finished races, but between the end of
  a race and Jolpica adding its results the label can say Round N with points after N-1.
- **"Final" label timing:** from the last race until Jolpica switches season, standings
  read "After Round N", not "Final <year> standings".
- **Next season fails to load after the final race:** the hero shows "<year> season
  complete · <next year> calendar coming soon" until a background refresh (every 15 min)
  succeeds.
- **Saved calendar covers the calendar only.** Standings keep their error card + Retry;
  a failed background refresh keeps old standings with their "Last updated" time.
- **Hero label while live** still reads "NEXT RACE WEEKEND" above the "LIVE NOW" block.
- **Off-season countdown target:** the hero counts to the next session (e.g. Practice 1),
  not the race itself. Confirm which is wanted.
- **"Times shown in ..." line** under the Schedule heading uses today's offset, which
  can differ from a race's offset in another month for daylight-saving zones (the
  cards themselves are correct per race date).
- **Team colours are approximations** (`src/data/teamColors.ts`); the Audi and Cadillac
  values were picked by Claude, not taken from an official source.
- **Testing note:** Jolpica answers 403 to Node's default client (a bot filter; browsers
  are fine), so scripts that call Jolpica from Node need saved data.

## Known open bugs

- None known right now.

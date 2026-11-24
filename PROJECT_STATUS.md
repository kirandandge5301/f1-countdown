# Project Status

_Last updated: 2026-11-25 · branch `fix/remove-driver-photos` (`496d1df`, not yet merged)_

## Done

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

## Still open (audit steps 4-5 and other items)

- **No "last known calendar":** when the calendar can't load there is only the error
  card. Showing the last good calendar labelled "as of ..." would need browser storage
  (allowed by `CLAUDE.md`, not built).
- **OpenF1 down during a season:** the hero shows Jolpica race dates with a race-start
  countdown labelled "times confirmed closer to the date", which is slightly off for an
  in-season race. If OpenF1 lists races but no sessions and Jolpica has none, the
  error card shows (wording is blunt).
- **Off-season countdown target:** with OpenF1 data the hero counts to the next
  session (e.g. Practice 1), not the race itself. Only the Jolpica-only case counts
  to race start. Confirm which is wanted.
- **Rollover needs a reload:** a page left open across the final race keeps showing
  the old season until refreshed. During a race the hero reads 00:00:00:00.
- **"Final" label timing:** from the last race until Jolpica switches season, standings
  read "After Round N", not "Final <year> standings".
- **Jolpica "After Round" label:** on 2026-11-21 Jolpica reported round 21 before that
  race had run (points unchanged), so the label can run ahead of the results.
- **Jolpica-only calendar:** circuit facts and race insights don't show (they are
  keyed by OpenF1 race names).
- **"Times shown in ..." line** under the Schedule heading uses today's offset, which
  can differ from a race's offset in another month for daylight-saving zones (the
  cards themselves are correct per race date).
- **Calendar source:** the race list itself still comes from OpenF1 meetings. Only the
  round numbers come from Jolpica. `CLAUDE.md` names Jolpica as the calendar source.
- **Constructor colors:** hardcoded `TEAM_COLORS` map in `src/services/openf1.ts`.
- **Cancelled single sessions** inside a non-cancelled weekend are not filtered yet.

## Known open bugs

- **HowToWatch shows literal `\u00b7`:** `src/sections/HowToWatchSection.tsx:43,50`
  use `\u00b7` in plain JSX string attributes, where JS escapes aren't processed.
  The badges read "WORLDWIDE \u00b7 OFFICIAL" instead of "WORLDWIDE · OFFICIAL".
- **Miami start time** differs between APIs (OpenF1 17:00Z, Jolpica 20:00Z).
  Matching still works; one source is wrong.

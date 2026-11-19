# Project Status

_Last updated: 2026-11-19 · commit `ab77165`_

## Changed this session

- **Standings now use the Jolpica API** (`/current/driverstandings.json`,
  `/current/constructorstandings.json`) instead of OpenF1 championship endpoints.
  - Real points and **wins** (previously always 0); season and round returned with data.
  - On any failure (network, non-OK status, empty list) the lists are cleared and an
    error card is shown. Hardcoded fallback standings are no longer used.
  - "Last updated <date, time> · After Round N" line shown under the tabs on success.
  - Driver headshots still come from OpenF1 `/drivers`, best-effort, matched by driver
    number. If that call fails, avatars show the plain circle; standings still load.
- **Retry behavior:** the error card's Retry button calls `refreshStandings()`, which
  reloads standings only. The calendar is not refetched, so Next Race / Schedule do
  not flash loading skeletons. `refresh()` still reloads everything.
- **Files touched:**
  - `src/services/openf1.ts` - Jolpica fetch + mapping; old OpenF1 standings code removed
  - `src/context/DataContext.tsx` - separate standings state, error, timestamp, retry
  - `src/sections/StandingsSection.tsx` - timestamp line + error card (layout unchanged)

## Still using old / static data

- **Calendar fallback:** `src/data/races.ts` (`RACES`) is used by `DataContext.tsx`
  whenever OpenF1 returns no meetings.
- **Constructor colors:** hardcoded `TEAM_COLORS` map in `src/services/openf1.ts`,
  keyed by Jolpica `constructorId`. New or renamed teams fall back to `#999999`.
- **Round count:** `src/sections/NextRaceSection.tsx:73` hardcodes `/ 24` instead of
  using the real number of rounds.
- **Unused helpers:** `src/f1api.ts` (`fetchCurrentSchedule`, `fetchDriverStandings`,
  `fetchConstructorStandings`, `convertRace`) is only imported by
  `src/hooks/useF1Schedule.ts`, which nothing uses.
- `src/data/standings.ts` is no longer imported anywhere.

## Known open bugs

- **HowToWatch shows literal `·`:** `src/sections/HowToWatchSection.tsx:43,50`
  put `·` in plain JSX string attributes (`badge="..."`), where JS escapes are not
  processed. The badges render "WORLDWIDE · OFFICIAL" instead of
  "WORLDWIDE · OFFICIAL". The same escapes in `src/data/broadcasters.ts` render fine.
- **Timezone label:**
  - In `src/components/ExpandableRaceCard.tsx:82` session rows always show times in
    UTC with a hardcoded "UTC", while the card's race time (line 128) uses the
    selected timezone and label.
  - `TimezoneContext.tsx` builds the label from the IANA ID (e.g. "Kolkata"), not the
    picker's names (e.g. "India"). It also starts as "Mumbai (GMT+5:30)" until the
    effect runs.

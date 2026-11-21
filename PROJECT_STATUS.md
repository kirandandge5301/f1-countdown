# Project Status

_Last updated: 2026-11-21 · branch `fix/round-numbers` (`da119aa`, not yet merged)_

## Done

- **Round numbers (step 1/5)** - `fix/round-numbers`, `da119aa`
  - Cancelled meetings (`is_cancelled`, e.g. Bahrain and Saudi Arabia 2026) are dropped
    at load, so they never reach the hero, schedule or next-race logic.
  - Rounds come from the Jolpica calendar, matched by race start time (within 24 h;
    or last day vs race date within 2 days if no Race session yet). Never by name.
  - If Jolpica fails or any weekend can't be matched, ALL weekends use sequential
    numbering by date, with one console warning (never a mix of the two).
  - "/ 24" and "24 ROUNDS" replaced by `totalRounds` (Jolpica count, else weekend count).
  - Season year lives in one constant: `SEASON_YEAR` in `src/services/openf1.ts`.
  - Files: `src/services/openf1.ts`, `src/context/DataContext.tsx`,
    `src/sections/NextRaceSection.tsx`, `src/sections/ScheduleSection.tsx`.
- **Standings on Jolpica** (`ab77165`): live points and wins, "Last updated" line,
  honest error card. Retry reloads standings only.
- **India broadcaster** (`6534024`): secondary card is now FanCode.

## Still open (audit steps 2-5 and other items)

- **Hard-coded year:** `SEASON_YEAR = 2026` and the "2026 Calendar." heading (step 2).
- **Static calendar fallback:** if OpenF1 returns nothing, `src/data/races.ts` is shown
  as if live, which breaks the "never show stale data as live" rule (step 3).
- **Calendar source:** the race list itself still comes from OpenF1 meetings. Only the
  round numbers come from Jolpica. `CLAUDE.md` names Jolpica as the calendar source.
- **Driver photos in standings:** `src/sections/StandingsSection.tsx:136` shows OpenF1
  headshots. `CLAUDE.md` design rules say no driver photos anywhere. Needs a decision.
- **Constructor colors:** hardcoded `TEAM_COLORS` map in `src/services/openf1.ts`.
- **Cancelled single sessions** inside a non-cancelled weekend are not filtered yet.
- **Unused code:** `src/f1api.ts` + `src/hooks/useF1Schedule.ts`, `src/data/standings.ts`.

## Known open bugs

- **HowToWatch shows literal `\u00b7`:** `src/sections/HowToWatchSection.tsx:43,50`
  use `\u00b7` in plain JSX string attributes, where JS escapes aren't processed.
  The badges read "WORLDWIDE \u00b7 OFFICIAL" instead of "WORLDWIDE · OFFICIAL".
- **Timezone label:**
  - `src/components/ExpandableRaceCard.tsx:82` session rows are always UTC (hardcoded
    "UTC") while the card's race time uses the selected timezone.
  - The label is built from the IANA ID (e.g. "Kolkata"), not the picker's names
    (e.g. "India"), and starts as "Mumbai (GMT+5:30)" before the effect runs.
- **Miami start time** differs between APIs (OpenF1 17:00Z, Jolpica 20:00Z).
  Matching still works; one source is wrong.

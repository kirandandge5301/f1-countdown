# PRD / Launch Upgrade Notes — GPCountdown Experimental Branch

## Original Problem Statement
Read project-audit.md, PRD.md, and the entire codebase.

Goal:
Move GPCountdown from launch-candidate to public-launch-ready.

Do not perform another audit.
Do not create additional planning documents.
Implement directly.

Requirements:

Priority order:
1. Race Week Experience
2. Previous Grand Prix Recap
3. Constructor Standings Upgrade
4. Launch Polish
5. Circuit Information
6. SEO / Metadata

Preserve current OpenF1 integration, countdown behavior, design language, dark/light mode, and build stability.
Do not install new dependencies unless absolutely necessary.

## Architecture Decisions
- Frontend-only React + TypeScript + Vite single-page app
- Active data flow uses OpenF1 from `src/services/openf1.ts`
- Hybrid recap layer uses live Jolpica race/qualifying data with seeded fallback data
- Shared app state via `ThemeContext`, `TimezoneContext`, and upgraded `DataContext`
- Static fallback datasets remain for schedule, standings, and recap resilience
- Single-page anchored sections instead of routed pages
- No new runtime dependencies added beyond installing existing lockfile packages

## What’s Implemented Now
- Single source of truth for race progression now prioritizes live OpenF1 season data and falls back only to a verified 2026 archive
- Bahrain and Saudi Arabia no longer appear in active race progression, countdown logic, recap logic, or schedule because they are not in the active verified season source
- Previous Grand Prix recap now uses live Jolpica results when available and verified archived results only when they match the selected verified season
- Fabricated seeded standings were removed; standings now show verified OpenF1 data or an unavailable state
- Circuit card now uses structured circuit data with real values or explicit unavailable messaging instead of unfinished placeholder text
- Timezone labels upgraded to professional labels like `India (IST)` and shared timezone logic is aligned across countdown, schedule, session cards, and race-week messaging
- Race-week messaging now supports race week, cars on track today, sprint day, qualifying day, lights out today, and race weekend complete based on real session timing
- Preview host configuration remains fixed for Emergent preview domains and build is verified successfully

## Prioritized Backlog

### P0
- Add richer Open Graph absolute URL/canonical metadata when final production domain is known
- Continue production QA across more mobile breakpoints and lower-bandwidth conditions
- Consider a lightweight backend/cache adapter if OpenF1 front-end rate limits become more frequent in production

### P1
- Replace remaining broad `any` usage in untouched legacy areas
- Add last-updated indicators for live modules
- Add explicit API health badges for schedule, recap, and standings modules
- Upgrade constructor logo treatment to curated approved assets if needed later

### P2
- Session reminders / calendar export
- Circuit explorer and richer editorial content
- Share cards and social growth surfaces
- Community / prediction features

## Next Tasks
- Monitor live OpenF1 rate limits and decide whether to add a server-side cache layer later
- Validate public frontend again after deployment with full mobile/browser coverage
- If desired, add last-updated timestamps and stricter API status surfaces next
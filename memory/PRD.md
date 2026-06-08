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
- Dynamic race-week hero experience with contextual phases: race week, practice day, sprint day, qualifying day, race day
- Fan-style race copy derived from current schedule/session data
- New Previous Grand Prix recap section below hero with winner, P2, P3, pole, fastest lap, and race date
- Hybrid recap service layer prepared for future live expansion
- Upgraded constructor standings with team branding, monogram logos, stronger color hierarchy, and richer cards
- Premium circuit details card for the next race with length, laps, distance, lap record, first grand prix, and DRS zones
- Timezone consistency improved in schedule detail rows
- Loading and empty states improved across hero, recap, schedule, and standings
- SEO basics and branding improvements in `index.html`
- SVG favicon and OG image assets added under `/app/public`
- OpenF1 retry added for simple 429 resilience
- Build verified successfully with `npm run build`

## Prioritized Backlog

### P0
- Fix public preview/deployment URL mapping so full external E2E can validate this app
- Do real mobile QA against the correct public frontend URL
- Add richer Open Graph absolute URL/canonical metadata when final production domain is known
- Review legacy unused schedule/data paths and remove safely

### P1
- Replace remaining broad `any` usage in untouched legacy areas
- Add last-updated indicators for live data modules
- Expand standings with gaps, movement, and wins
- Upgrade constructor logo treatment to real brand assets if desired later
- Add favorites for driver/team personalization

### P2
- Session reminders / calendar export
- Circuit explorer and richer editorial content
- Share cards and social growth surfaces
- Community / prediction features

## Next Tasks
- Validate the live public frontend URL end-to-end with Playwright
- Decide whether to replace constructor monogram marks with curated brand logo assets
- Continue polishing race-week storytelling and post-session recap depth
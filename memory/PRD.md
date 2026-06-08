# PRD / Audit Notes — GPCountdown Experimental Branch

## Original Problem Statement
Analyze the GitHub repository currently loaded from the experimental branch.

Do not modify code.

Produce a detailed project audit covering:

1. Current implemented features
2. OpenF1 integrations currently active
3. Calendar and countdown architecture
4. Standings architecture
5. Mobile responsiveness status
6. Missing launch-critical features
7. Technical debt and code risks
8. Opportunities for premium F1 fan experience improvements

Then create a prioritized roadmap grouped into:
- Must Have Before Launch
- Version 1.1
- Future Ideas

Estimate effort and impact for each item.

Do not write code yet.

## Architecture Decisions Observed
- Frontend-only React + TypeScript + Vite single-page app
- Active data flow uses OpenF1 from `src/services/openf1.ts`
- Shared app state via `ThemeContext`, `TimezoneContext`, and `DataContext`
- Static fallback datasets remain for schedule and standings
- Single-page anchored sections instead of routed pages

## What Was Implemented Before Audit
- Next race countdown hero
- Full 2026 schedule with expandable race cards
- How-to-watch section with regional broadcasters
- Driver and constructor standings
- Theme toggle and timezone selection
- OpenF1 integration for calendar and standings

## Prioritized Backlog

### P0
- Verify dependency install and production build path
- Clean legacy unused schedule/data paths
- Add explicit fallback / stale / failure UX for live data
- Complete missing race insights and circuit metadata
- Make timezone display consistent across all session views
- Add launch-grade SEO and social metadata
- Perform real mobile QA on key breakpoints

### P1
- Replace broad `any` usage in data flow
- Add last-updated indicators for live data
- Add favorites for driver/team personalization
- Expand standings with gaps, movement, and wins
- Add richer race weekend context

### P2
- Session reminders / calendar export
- Circuit explorer and richer editorial content
- Share cards and social growth surfaces
- Community / prediction features

## Next Tasks
- Convert this audit into implementation tickets
- Tackle P0 launch blockers first
- Preserve current visual quality while improving trust, completeness, and resilience
# GPCountdown — Technical Specification

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.1 | UI framework |
| react-dom | ^19.1 | DOM rendering |
| vite | ^6.3 | Build tool |
| @vitejs/plugin-react | ^4.4 | Vite React support |
| tailwindcss | ^4.1 | Utility-first CSS |
| @tailwindcss/vite | ^4.1 | Tailwind Vite integration |
| lucide-react | ^0.511 | Icons (globe, sun, moon, menu, x, arrow-up-right, tv, chevron-down) |
| typescript | ^5.8 | Type safety |
| @types/react | ^19.1 | React type definitions |
| @types/react-dom | ^19.1 | ReactDOM type definitions |

No animation library — all animations are CSS transitions and keyframes. No shadcn/ui — the design is fully custom and minimalist.

---

## Component Inventory

### Layout

| Component | Source | Reuse | Notes |
|-----------|--------|-------|-------|
| Header | Custom | Once | Sticky nav with logo, links, timezone selector, theme toggle. Mobile: hamburger → full-screen overlay. |
| MobileNav | Custom | Once | Full-screen overlay menu triggered by hamburger. Staggered link entrance. |
| Footer | Custom | Once | Minimal copyright + tagline. |

### Sections

| Component | Source | Reuse | Notes |
|-----------|--------|-------|-------|
| NextRaceSection | Custom | Once | Hero: ambient glow, grid bg, countdown, session cards. The signature section. |
| ScheduleSection | Custom | Once | 24-row calendar table with sprint badges and next-race highlight. |
| HowToWatchSection | Custom | Once | Two broadcast cards + country selector with dynamic broadcaster cards. |
| StandingsSection | Custom | Once | Tab control + two tables (Drivers/Constructors) with team color bars. |

### Reusable Components

| Component | Source | Used By | Notes |
|-----------|--------|---------|-------|
| SectionLabel | Custom | All 4 sections | Red dot + uppercase label. Props: `text` string. |
| SessionCard | Custom | NextRaceSection | Session info card with active/inactive states and mini-countdown. Props: `session`, `isActive`, `isNext`, `timezone`. |
| CountdownDisplay | Custom | NextRaceSection, SessionCard | Four-group digit display (DD : HH : MM : SS). Props: `targetTime` (Date), `timezone`, `size` ("hero" or "mini"). |
| BroadcastCard | Custom | HowToWatchSection | Large card (red or dark variant) with badge, title, description. Props: `variant` ("red" | "dark"), `badge`, `title`, `description`, `href`. |
| CountrySelector | Custom | HowToWatchSection | Row of pill buttons. Props: `selected`, `onSelect`, `countries`. |
| TabControl | Custom | StandingsSection | Two-pill tab switcher. Props: `tabs`, `activeTab`, `onChange`. |
| TimezoneSelector | Custom | Header | Dropdown with IANA timezone list. Props: `value`, `onChange`, `options`. |
| ThemeToggle | Custom | Header | Sun/moon icon swap button. Props: `theme`, `onToggle`. |

### Hooks

| Hook | Purpose |
|------|---------|
| useCountdown | Returns `{ days, hours, mins, secs, isExpired }` from a target Date. Updates every 1s via setInterval. Cleans up on unmount. |
| useIntersectionObserver | Wraps IntersectionObserver for scroll-triggered entrance animations. Threshold 0.15. Sets a ref-based "visible" flag. |
| useTheme | Manages dark/light theme class on `<html>`, reads/writes localStorage (key: "gpcountdown-theme", default: "dark"). |
| useTimezone | Manages selected IANA timezone, reads/writes localStorage (key: "gpcountdown-tz", default: detected local or Asia/Kolkata). |
| useActiveSection | Tracks which section is in viewport for nav highlighting. Uses IntersectionObserver on each section with rootMargin for header offset. |

---

## Animation Implementation

| Animation | Library | Implementation | Complexity |
|-----------|---------|----------------|------------|
| Section entrance (fade + translateY) | CSS keyframes | `@keyframes reveal { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }` — class toggled by IntersectionObserver. Children stagger via `animation-delay` calc on nth-child. | Low |
| Session card entrance stagger | CSS keyframes | Same reveal keyframe, staggered 100ms per card via inline `animation-delay`. | Low |
| Schedule row stagger | CSS keyframes | Same reveal, 40ms stagger per row. Triggered when table enters viewport. | Low |
| Broadcast card entrance | CSS keyframes | Same reveal, 120ms stagger between the two cards. | Low |
| Country pill entrance | CSS keyframes | Fade in, 50ms stagger after cards. | Low |
| Standings row stagger | CSS keyframes | Same reveal, 50ms stagger per row. Re-triggers on tab switch. | Low |
| Tab content crossfade | CSS transition | `opacity` + `transform: translateY(4px)` transition 0.2s on tab content wrapper. Key change forces remount. | Low |
| Theme toggle | CSS transition | CSS custom properties swap instantly on class change. No JS animation needed. | Low |
| Timezone switch | — | Times recalculate and re-render. No animation — instant update is correct UX for data changes. | Low |
| Card hover (translateY) | CSS transition | `transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)` on hover: `translateY(-2px)`. | Low |
| Card hover (border) | CSS transition | `transition: border-color 0.3s` on hover state. | Low |
| Mobile menu overlay | CSS transition | Overlay `opacity 0.3s`, links `translateY(8px→0)` with 50ms stagger. | Low |
| Hero countdown entrance | CSS keyframes | Digits: `opacity 0→1, translateY(20px→0)`, 800ms, 200ms delay, expo ease-out. | Low |
| Country broadcaster swap | CSS transition | Cards crossfade `opacity 0.2s` on content change. | Low |

**No animation library needed.** All effects are achievable with CSS `@keyframes` and `transition`. Performance: only `transform` and `opacity` are animated. `prefers-reduced-motion: reduce` disables all animations (elements appear immediately).

---

## State & Logic Plan

### Time/TZ Logic (Critical — custom implementation required)

All race session times are stored as ISO 8601 UTC strings in the race data. The timezone system has two display modes:

1. **Local timezone** (default): Uses `Intl.DateTimeFormat().resolvedOptions().timeZone` to detect user TZ. Falls back to `Asia/Kolkata`. Falls back further to `UTC`.
2. **Selected timezone**: User picks from dropdown. Persisted in localStorage.

**Time conversion strategy:**
- Countdown math: Pure `Date` arithmetic. Target UTC `Date` minus `new Date()` (browser local). Result is milliseconds — timezone-agnostic.
- Display formatting: Use `new Date(utcString).toLocaleTimeString('en-US', { timeZone: selectedZone, hour12: false, hour: '2-digit', minute: '2-digit' })` for session times.
- Date formatting: Use `toLocaleDateString('en-US', { timeZone: selectedZone, weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()` for "FRI 05 JUN" format.
- Timezone label: Compute offset string (e.g., "GMT+5:30") from a known UTC time rendered in the selected zone.

**Next race detection:**
- Iterate all races in round order. For each race, iterate sessions in chronological order (FP1 → FP2 → FP3 → Sprint Qualifying → Sprint → Qualifying → Race). Find the first session where `sessionTime > now`. That session is the "next session." The race it belongs to is the "next race." This runs on mount and re-checks when countdown expires.

**Mini countdowns (session cards):**
- Each session card gets its own `useCountdown` hook instance targeting that session's UTC time. 5 concurrent intervals — negligible performance impact.

### Data Architecture

- All 2026 race data, driver standings, constructor standings, and broadcaster mappings are **static JSON objects** imported as modules. No fetch, no API.
- `RACES` array: 24 objects with round, date, GP name, circuit, country code, city, sprint flag, and sessions map (UTC ISO strings).
- `DRIVERS_STANDINGS` and `CONSTRUCTORS_STANDINGS` arrays: Static sample data.
- `BROADCASTERS` map: Country code → `{ primary, secondary }` objects.

### State Management

All state is local (React `useState`/`useContext`). No external state library needed.

- `ThemeContext`: Provides `theme` ("dark" | "light") and `toggleTheme`. Applies class to `<html>`, persists to localStorage.
- `TimezoneContext`: Provides `timezone` (IANA string), `timezoneLabel` (display string like "GMT+5:30"), and `setTimezone`. Persists to localStorage. Provides `formatTime(utcString)` and `formatDate(utcString)` helpers.
- Component-local state: Active tab (Standings), selected country (How to Watch), mobile menu open (Header).

### React Key Decisions

- `StrictMode` is on — `useCountdown` must handle double-mount cleanup correctly (useEffect cleanup function clears interval).
- `useCountdown` hook is the most reused piece: it takes a target `Date`, returns live-updating time parts, and signals expiry. Used by the hero countdown and all 5 session card mini-countdowns.
- Standings tab switch forces table remount (different `key` prop) to re-trigger entrance stagger animation.
- Country broadcaster switch in HowToWatch crossfades via CSS opacity transition on keyed wrapper.

---

## Other Key Decisions

### Single-page architecture
All four "pages" are `<section>` elements on one scrollable page with `id` anchors. Header nav uses `scrollIntoView` for navigation. No React Router — eliminates routing complexity for a scroll-driven experience. URL hash updates on section change via `useActiveSection`.

### Tailwind v4 with CSS-first configuration
Use `@import "tailwindcss"` and `@theme` blocks in `index.css` to define custom colors, fonts, and spacing tokens as CSS variables. This enables instant theme switching by toggling a `.dark`/`.light` class on `<html>` — all `--bg-*`, `--text-*` values swap via the CSS variable system. No JS re-rendering needed for theme changes.

### No font loading
The design specifies system fonts (SF Pro, SF Mono, Inter, system-ui). These are already available on macOS/iOS and good fallbacks exist for other platforms. No `@font-face` declarations or external font requests — keeps the page load instant and aligns with the Apple-native aesthetic.

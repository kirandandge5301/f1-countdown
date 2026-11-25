# Share cards: plan

## Progress

| Stage | Status | Commit |
|---|---|---|
| 0 Research and plan | done | see git log "share-cards stage 0" |
| 1 Content, playlist state, qualifying service, tests | done | |
| 2 Cards and Card Studio | done | |
| 3 Share dialog and hero | done | |
| 4 Playlist section | done | |
| 5 Docs and rules | done; next: phone test (BRIEF section 13), then merge | |

## Decided (Kiran, 25 Nov 2026): option A for the pole card

Kiran also approved committing every remaining stage once its checks pass. Push and merge still need asking.


Jolpica says who was **fastest in qualifying**, not who holds **pole** (see RESEARCH.md).

- **A (chosen):** the card says "FASTEST IN QUALIFYING". Button: "Share qualifying". Caption:
  "Fastest in qualifying at the Qatar Grand Prix: ...". Count: "9th time fastest in qualifying in 2026".
  Always true.
- **B (rejected):** keep "POLE POSITION" as briefed. Wrong whenever the fastest driver has a grid penalty.
- **C (rejected):** drop this card from v1.

## Architecture

As in BRIEF section 5. `src/features/share/` is a separate lazy chunk. `src/features/playlist/` is in the
main bundle, small, using `zod/mini`. Pure logic never reads the clock: `now` is passed in. A React
context supplies the real clock, which Studio overrides.

## Files

- **Stage 1:** `package.json` and lock file, `vitest.config.ts` if needed,
  `public/content/race-weeks.json`, `src/features/playlist/{content,playlistState,embeds}.ts`,
  `src/services/qualifying.ts`, tests.
- **Stage 2:** `src/features/share/{cardModel,layouts,render,fonts}.ts`, `Studio.tsx`, the `now` context,
  `public/fonts/`, `vite.config.ts` (dev-only export), `src/App.tsx`.
- **Stage 3:** `share.ts`, `ShareDialog.tsx`, `src/sections/NextRaceSection.tsx`.
- **Stage 4:** `PlaylistSection.tsx`, `src/components/Header.tsx`, `src/App.tsx`.
- **Stage 5:** `CLAUDE.md`, `DAILY-UPDATE.md`, `PROJECT_STATUS.md`.

## Tests

As in BRIEF section 11, using `docs/share-cards/fixtures/` (real Jolpica responses, no live calls).
One extra case: Las Vegas, where qualifying P1 and grid 1 differ, must never produce a false "pole".

## Risks

- Anything in `race-weeks.json` is public at once: a track with a future `revealAt` can be read early in
  the file. Adding each track on its own day avoids most of this.
- Signed-out listeners may get previews rather than full songs.
- A bad Apple link can show a blank box, so the daily runbook includes checking links.
- Some apps may drop the caption when an image is shared; "Copy caption" covers it.
- Code freeze 27-29 Nov and 4-6 Dec: merging has to happen 30 Nov - 3 Dec, or after 6 Dec.

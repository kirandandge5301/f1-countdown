# GPCountdown: rules for Claude Code

## Who I am
Kiran, solo founder, not a professional developer. Explain important decisions in plain language.

## Workflow
- One task per session. New branch per task (`fix/<name>` or `feature/<name>`), off the latest `main`.
- Never commit, push or merge without my approval. Show me the diff first and wait.
- Run `npm run build` before showing a diff. No new TypeScript errors.
- After each approved task, update PROJECT_STATUS.md (what changed, what's still open).
- Don't touch files outside the task. If something else needs changing, tell me instead.
- End every reply with `npm run dev` → http://localhost:3000, the live site https://f1-countdown-pearl.vercel.app, and any preview link.

## Data rules (non-negotiable)
- Never show invented, hard-coded or stale data as live.
- Jolpica (https://api.jolpi.ca/ergast/f1) is the source for the calendar, round numbers, results and standings.
- OpenF1 (https://api.openf1.org/v1) is for session times only.
- Skip races and sessions with `is_cancelled: true`.
- Never match races between the two APIs by name (they name races differently).
- If data can't be loaded, show an honest error or clearly labelled cached data ("as of …").

## Editorial content
- Editorial content (taglines, playlists, covers, off-week messages) lives only in `public/content/race-weeks.json` and `public/playlists/`, and never contains live facts.
- Content-only updates (those two paths only) may be committed straight to `main` after `npm test` and `npm run build` pass and Kiran approves. The race-weekend code freeze doesn't apply to them.
- Steps: `docs/share-cards/DAILY-UPDATE.md`.

## Design rules
- Keep the existing identity: deep black/charcoal, restrained red (#E10600), white editorial type, grey secondary text, rounded cards, generous space.
- No redesigns.
- No F1, FIA or team logos, and no driver photos, anywhere, including share cards.
- No music-service logos and no album art copied by us.

## Costs
- No paid services and no new libraries or dependencies without asking me first.

# Share cards + race-week playlist: build brief (v1)

_Written 25 Nov 2026 for Claude Code. Owner: Kiran. Repo: kirandandge5301/f1-countdown._

---

## 0. How to run this brief

- Follow `CLAUDE.md`. This brief adds to it for this feature only.
- **Pre-approved:** create branch `feature/share-cards` off the latest `main`; create and edit the files this brief names; add `vitest` as a devDependency with `"test": "vitest run"`; run build, lint, tests and the dev server; open the local dev site in the default browser from the shell.
- **Ask Kiran before:** every commit, every push, every merge, any other new dependency, deleting files, anything that costs money.
- **Stages:** do the stages below in order. At the end of each stage `npm run build`, `npm run lint` and `npm test` must pass; then report (format in §14) and ask "Commit stage N?". If Kiran answers **"approve all"**, commit each remaining stage as soon as it passes. Still never push or merge without asking.
- **Stop mid-stage only if:**
  - research contradicts this brief in a way that changes what fans see
  - you need another dependency
  - a change would break an existing feature
  - data accuracy is at risk

  Otherwise decide sensibly, note the decision in the report, and keep going.
- **Code freeze:** never merge to `main` during a race weekend, from Friday until Sunday's race ends: Qatar 27–29 Nov, Abu Dhabi 4–6 Dec 2026. Pushing `feature/share-cards` for a Vercel preview is fine at any time, with approval.
- **Progress log:** keep a "Progress" list at the top of `docs/share-cards/PLAN.md` (stage, status, commit). A new session resumes from it.
- **Explain in plain language.** Kiran is not a professional developer.
- **End every reply with:** `npm run dev` → http://localhost:3000 (this project's dev port, set in `vite.config.ts`), the live site https://f1-countdown-pearl.vercel.app, and the preview link if a branch was pushed.

## 1. What exists (check, don't assume)

- **Stack:** Vite 7, React 19, TypeScript and Tailwind, on a single page. `react-router` is installed but unused.
- **Sections** (in `src/App.tsx`): hero (`NextRaceSection`), Schedule, How to watch, Standings.
- **Themes and time:** light and dark themes (`ThemeContext`) and a time zone picker (`TimezoneContext`).
- **Data:**
  - `src/services/openf1.ts` and `src/context/DataContext.tsx` handle everything.
  - Jolpica supplies calendar, rounds, results and standings; OpenF1 supplies session times only.
  - The data layer also has a live state and refreshes every 15 minutes.
- **Usable without asking** (already installed): `zod` (use `zod/mini` in the main bundle), `sonner`, `lucide-react`, and the Radix dialog in `src/components/ui/dialog.tsx`. The rest of the shadcn kit is unused; don't touch it.
- **Hero, to replace:** a "🏁 Share Countdown on X" button and a tagline line ("The roar is coming." on the live site). Find both; this feature replaces that button. Report where the tagline comes from.
- **Old share attempt:** `origin/feature/premium-social-sharing` (June) may hold one. Skim it for reusable ideas only and never merge it.
- **Tests:** none yet.
- **Jolpica and Node:** Jolpica answers 403 to Node's default HTTP client (a bot filter). For fixtures, use the browser or `curl` with a descriptive User-Agent, e.g. `GPCountdown-dev (+https://f1-countdown-pearl.vercel.app)`. Tests never call live APIs.

## 2. What we're building

A curated race-week experience: brand share cards plus a race-week playlist Kiran curates.

1. **Share cards.** PNGs drawn in the browser, in three types (countdown, pole position, "race-week playlist out now") and two formats (Story 1080×1920, Post 1080×1350).
2. **Share dialog.** Uses each platform's real capabilities: Instagram, X, Facebook, WhatsApp.
3. **Race-week playlist section.** One track revealed per day Monday to Thursday at 05:00 IST; the full playlist drops Friday 05:00 IST. A warm "waiting" state in weeks without a playlist.
4. **Card Studio.** At `/?studio`, unlisted. Kiran previews the week's cards and playlist states.
5. **Editorial content file.** Kiran updates it daily through Claude Code.

**Non-negotiables:**
- CLAUDE.md data rules.
- **No song or artist on any card.**
- No F1, FIA or team logos, no driver photos, no music-service logos, and no album art copied by us.
- Nothing invented is shown as live.
- The site stays fast.

## 3. Decisions already made (don't reopen)

- **Colours:**
  - white #FFFFFF
  - grey #808080
  - black #0A0A0A
  - red #E10600 (race title)
  - dark text #111111
- **Fonts:** Inter Tight 300/500/800 (already loaded in `index.html`); Instrument Serif Italic for taglines (self-hosted, see §7).
- **Layouts** (Kiran picks one per week in the content file):
  - **N8 Big number.** White top band (about 36%): kicker, red title, tagline. Grey bottom band: one huge light-weight figure, caption, details, wordmark.
  - **N7 Night.** Black top band (about 50%): grey kicker, red title, light-grey tagline. Grey bottom band: hero figure, caption, details, wordmark.
  - **N3 Thirds.** White band (kicker, red title), grey middle band (hero figure), black bottom band (tagline, details, wordmark).
  - The red title sits only on white or black, never on grey.
- **Card types:** countdown, pole, playlist-out-now. The playlist card uses Kiran's own cover art and shows no track names.
- **Playlist schedule:**
  - One track revealed at 05:00 IST each day, Monday to Thursday (4 tracks).
  - The full drop is Friday 05:00 IST (10–12 tracks in total).
  - Times are stored with an explicit `+05:30` offset and shown in each visitor's selected time zone.
- **Services:** Spotify, Apple Music and YouTube Music. Kiran has all three and publishes the same playlist on each, adding tracks daily.
- **Weeks without a playlist:** the section stays, with a warm message, a countdown to the next drop, and the last playlist to replay.

## 4. Stage 0: research and plan (no feature code)

Verify these against the live services and write `docs/share-cards/RESEARCH.md`, separating facts from assumptions and listing sources.

1. **Jolpica qualifying:** `https://api.jolpi.ca/ergast/f1/{season}/{round}/qualifying.json`.
   - Fields: position, Driver (givenName, familyName, driverId, code), Constructor name, Q1/Q2/Q3.
   - What an unpublished round returns.
   - Save the 2026 round 21 (Las Vegas) response as a fixture.
2. **Season poles:** `https://api.jolpi.ca/ergast/f1/{season}/qualifying/1.json?limit=100`. Confirm it returns P1 for each round, and save a fixture.
3. **Embeds:**
   - Spotify: `open.spotify.com/embed/track|playlist/{id}`.
   - Apple Music: `embed.music.apple.com/...` for playlist links, album links with `?i=`, and `/song/` links.
   - For each: working iframe attributes and heights.
   - YouTube Music: link only.
4. **Sharing:**
   - Web Share Level 2 (`navigator.canShare({ files })`).
   - Clipboard image write (`ClipboardItem` with `image/png`).
   - X intent: `https://x.com/intent/tweet?text=&url=`.
   - Facebook sharer: `https://www.facebook.com/sharer/sharer.php?u=` (URL only, no pre-filled text).
   - WhatsApp: `https://wa.me/?text=`.
   - Note browser support for each, and the rule that these need a fresh user action.
5. **Canvas:** text with web fonts (`document.fonts.load`) and Instagram Story safe zones.

Then write `docs/share-cards/PLAN.md`: Progress list, architecture (§5), file list, test plan, risks. Commit this brief, RESEARCH and PLAN as stage 0 (ask first).

## 5. Architecture

**`src/features/share/`** (lazy-loaded; not in the main bundle)
- `cardModel.ts` (pure): builds a CardModel for each card type from live data, content, `now` and the time zone. Slots: kicker, title, tagline, subject, hero, heroCaption, details[], stamp, wordmark, and cover (optional).
- `layouts.ts`: N8/N7/N3 as data. Bands (colour, height ratio per format and card type), slot positions, font sizes, text colours.
- `render.ts`: Canvas 2D renderer. Draws a CardModel with a layout at a format and returns a PNG Blob. Text fitting: wrap, then shrink to a minimum size, then ellipsis as a last resort. Text never overflows.
- `fonts.ts`: loads the Inter Tight weights and Instrument Serif Italic before drawing. After a 3-second timeout it falls back to a system font with a console warning; it never blocks sharing.
- `share.ts`: captions, hashtags, links with UTM tags, platform actions.
- `ShareDialog.tsx`: preview and actions.
- `Studio.tsx`: Card Studio.

**`src/features/playlist/`** (main bundle, small; iframes load only after a tap)
- `content.ts`: fetches and validates `race-weeks.json`, safely at runtime.
- `playlistState.ts`: pure state machine (§8).
- `embeds.ts`: pure URL converters for embeds and links.
- `PlaylistSection.tsx`: the UI.

**Other files**
- `src/services/qualifying.ts`: `fetchQualifying(season, round)` and `fetchSeasonPoles(season)` from Jolpica. Returns null on failure, and never caches a failure.
- `public/content/race-weeks.json`: Kiran's content (§6).
- `public/playlists/`: Kiran's cover art.
- A `now` override (React context) lets Studio preview any moment. The live site always uses the real clock.

## 6. Content file: `public/content/race-weeks.json`

Plain JSON, fetched at runtime with `cache: 'no-cache'` and fetched again on the existing 15-minute refresh, so open tabs pick up new tracks without a reload.

Example (shape only; ship the file with `"weeks": []`, never invented tracks):

```json
{
  "version": 1,
  "defaultOffWeekMessage": "No race this weekend, so no new playlist yet. We're waiting for lights out too. Back on race week.",
  "weeks": [
    {
      "id": "2026-r23",
      "kind": "race",
      "season": 2026,
      "round": 23,
      "startsAt": "2026-11-30T05:00:00+05:30",
      "endsAt": "2026-12-07T05:00:00+05:30",
      "tagline": "Example tagline",
      "layout": "N8",
      "playlist": {
        "title": "Abu Dhabi race week",
        "cover": "playlists/2026-r23.jpg",
        "links": {
          "spotify": "https://open.spotify.com/playlist/EXAMPLE",
          "appleMusic": "https://music.apple.com/in/playlist/example/pl.EXAMPLE",
          "youtubeMusic": "https://music.youtube.com/playlist?list=EXAMPLE"
        },
        "dropAt": "2026-12-04T05:00:00+05:30",
        "tracks": [
          {
            "title": "Track title",
            "artist": "Artist",
            "revealAt": "2026-11-30T05:00:00+05:30",
            "note": "Optional one-line note",
            "links": { "spotify": "https://open.spotify.com/track/EXAMPLE" }
          }
        ]
      }
    }
  ]
}
```

**Field rules**
- `id`: unique, e.g. `2026-r23` or `offweek-2026-12-14`.
- `kind`: `race` needs `season` and `round` (the Jolpica round); `off` has no round.
- `startsAt` / `endsAt`: ISO 8601 with an offset.
  - **Default rule** (used by Studio): the week starts Monday 05:00 IST of the race week and ends 7 days later.
  - **Race week:** the Monday–Sunday week (in IST) that contains the race start minus 2 days. This puts Americas races that start Monday 01:30 IST in the previous week, where they belong.
  - Weeks must not overlap.
- `tagline`: optional, ≤ 45 characters, Kiran's words.
- `hashtag`: optional. Default: derived from the race name, e.g. "Qatar Grand Prix" → `#QatarGP`, accents removed.
- `layout`: `N8`, `N7` or `N3`.
- `playlist`: optional.
  - `title`: ≤ 60 characters.
  - `cover`: path under `playlists/`, Kiran's own square art, .jpg/.png/.webp, ≤ 600 KB.
  - `links`: `spotify`, `appleMusic`, `youtubeMusic`. https only, and only those services' hosts.
  - `dropAt`: the Friday drop time.
  - `tracks[]`: `title`, `artist`, `revealAt`, optional `note` (≤ 80), optional `links`. Sorted by `revealAt`, and every `revealAt` must fall between `startsAt` and `dropAt`.
- `offWeekMessage`: optional, for `off` weeks.
- `defaultOffWeekMessage`: top level. Draft a warm one; Kiran will edit it.
- **Never** put live facts (session times, results, standings, round totals) in this file.

**Validation:** a zod schema plus the cross-field rules.
- **In the app:** an invalid entry is skipped with one console warning. The page never breaks because of content.
- **In tests:** the real file must have zero errors, and every cover file must exist and be ≤ 600 KB.

## 7. Cards (Stage 2)

**Formats**
- **Story 1080×1920:** keep text inside y 250–1670 and x 80–1000, because Instagram's own buttons cover the top and bottom.
- **Post 1080×1350:** 80 px margins.

**Countdown card**
- **Kicker:** e.g. `ROUND 22 / 23 · LUSAIL` (Jolpica round, total, circuit locality).
- **Title:** Jolpica race name, in red.
- **Tagline:** from the week's content.
- **Hero:** time to **lights out**, meaning the race start, not the next session.
  - N8: the big days number plus "days to lights out" ("day" if 1).
  - N7 and N3: `3d 14h 22m`.
  - Under 1 day: `14h 22m`. Under 1 hour: `42m`.
  - Race live: `LIVE` plus "Race · live now".
  - Another session live: keep the countdown and add e.g. "Practice 1 · live now".
  - Race time not published: the race date plus "race day · time TBC".
- **Details:** race start in the selected time zone, with its label.
- **Stamp:** e.g. "As of 26 Nov · 21:10 India (GMT+5:30)", the generation time. The image is a snapshot and has to say so.

**Pole card**
- **Kicker:** `POLE POSITION · ROUND 22`.
- **Title:** race name, in red.
- **Subject:** driver's full name and team, as text only.
- **Hero:** the pole lap.
  - Take P1's Q3 time. If Q3 is missing, use their best time from the last session they set one in, labelled "Q2" or "Q1".
  - Never re-rank drivers yourself.
- **Caption:** "Pole lap · Q3".
- **Details:**
  - The gap to P2 in the same session (e.g. `+0.087s to Norris`), only if both times exist.
  - e.g. "3rd pole of 2026", only if the season list loaded.
- **No tagline.**
- **When it's offered:** only once Jolpica has the round's qualifying. Start checking after the Qualifying session's end time; the button shows until race start + 3 h.
- **Sprint qualifying:** out of scope.

**Playlist-out-now card**
- **Kicker:** `RACE-WEEK PLAYLIST · ROUND 23`, or `OFF-WEEK PLAYLIST`.
- **Title:** race name in red, or the playlist title for off weeks.
- **Tagline:** from the week's content.
- **Hero:** Kiran's cover, from a same-origin file only, so the canvas can still be exported.
- **Caption:** "Out now · 12 tracks".
- **Details:** the available services as text, e.g. "Spotify · Apple Music · YouTube Music".
- **No track names.**

**Every card**
- Wordmark `GPCOUNTDOWN`.
- A URL line only if `VITE_SITE_URL` is set and its host is ≤ 24 characters. The long vercel.app host stays off the card; the captions carry the link.

**Contrast:** text must be readable at phone size (about 36% scale).
- On #808080: white text only, ≥ 40 px at weight 500, or ≥ 48 px light.
- Small text on white or black needs ≥ 4.5:1. If Kiran's grey fails, use the nearest shade that passes and list the change.

**Fonts:** self-host Instrument Serif Italic (Open Font License) in `public/fonts/`, together with its `OFL.txt`. Download `InstrumentSerif-Italic.ttf` from the google/fonts GitHub repo (`ofl/instrumentserif`). If that fails, inject the Google Fonts CSS link on demand instead.

**Export:** PNG via `canvas.toBlob`, ≤ 2 MB, named `gpcountdown-{type}-{season}-r{round}-{story|post}.png`.

### Card Studio (Stage 2)

- Opens at `/?studio`, lazy-loaded, with no router change. It isn't linked anywhere and adds `noindex` while open.
- **Controls:**
  - pick a week (existing entries plus upcoming rounds from the live calendar), a card type, a layout and a format
  - a tagline field with a 45-character counter
  - a "now" date-time input to preview any moment
- **Previews:** the card previews, plus the playlist section as it would look at that "now".
- **"Copy entry JSON":** builds a valid entry with the default times: track slots Monday–Thursday 05:00 IST, drop Friday 05:00 IST.
- **No fake official cards:** every Studio canvas carries a "STUDIO PREVIEW" watermark, and Studio has no download or share buttons.
- **Dev-only sample export:** `/?studio&export=samples`, only under `npm run dev`.
  - Renders the sample matrix without the watermark and POSTs each PNG to a dev-only Vite middleware (`configureServer`, `apply: 'serve'`).
  - The middleware accepts only filenames matching `^[a-z0-9-]+\.png$`, at most 5 MB, and writes only to `docs/share-cards/samples/`.
  - Search `dist/` to confirm that neither the endpoint nor the unwatermarked export ends up in the production build.

### Visual self-check loop (required)

1. Start `npm run dev`. Open `http://localhost:3000/?studio&export=samples` in the default browser from the shell (Windows: `cmd //c start "" "<url>"`, or PowerShell `Start-Process`).
2. Read every PNG yourself and check:
   - nothing is clipped or overflowing
   - safe areas are respected
   - the contrast rules are met
   - the red title is never on grey
   - alignment is consistent
   - the wordmark is present
   - there are no track names, logos or photos
3. Fix and repeat until every sample is clean.

**Sample matrix:** N8, N7 and N3 × these cards × Story and Post:
- countdown, 3+ days
- countdown, under 1 day
- countdown, race live
- pole, using the real 2026 round 21 fixture
- playlist out now, with a generated grey "TEST COVER" square (never a real image)

**Edge cases:**
- "Andrea Kimi Antonelli"
- "Bahrain Grand Prix in Malaysia"
- "São Paulo Grand Prix"
- no tagline
- a 45-character tagline
- race time TBC

Ask before committing samples; suggest about 6 representative ones.

## 8. Playlist state machine (Stage 1) and section (Stage 4)

`getPlaylistState(content, weekends, now)` returns one of:
- **`upcoming`:** a week has started, but its first track isn't revealed yet. Shows "Track 1 drops in …".
- **`daily`:** the tracks revealed so far, today's track, "Day N of M", and the next reveal or the Friday drop time.
- **`dropped`:** the full playlist, from `dropAt` until `endsAt`.
- **`soon`:** a race week has started but there's no playlist entry yet. Shows "This week's playlist is coming soon", with no promised time.
- **`waiting`:** no active week. Shows:
  - the week's `offWeekMessage`, or the default message
  - the next drop: from the next entry if one exists, else computed from the calendar with the race-week rule (Monday 05:00 IST of the next race week, with that race's name)
  - the most recent dropped playlist, to replay

  If the season is over and the next calendar is unknown: "Next playlist: when the 2027 season starts", with no countdown.

The section re-renders exactly when a reveal, drop or end time passes, using a timer to the next change, the same way the hero does.

**Section UI**
- **Placement and style:**
  - `id="playlist"`, right after the hero.
  - Add "Playlist" to the header nav if the nav has section links.
  - Follows the light/dark tokens and matches the site's style.
- **Heading:** "Race-week playlist", plus the race name or playlist title, plus the cover.
- **Daily state:**
  - today's track (title, artist, note) and the earlier tracks
  - the next-reveal countdown
  - "Follow on Spotify / Apple Music / YouTube Music" buttons. These are playlist links, so fans get the daily additions in their own app.
  - an open link for each track
- **Dropped state:** "Out now · 12 tracks", the full track list, the Follow buttons, and a Share button for the playlist card.
- **Waiting state:**
  - the warm message
  - the next-drop countdown, e.g. "Next playlist drops Mon 05:00 India (GMT+5:30) · Abu Dhabi race week · in 3d 4h"
  - the last playlist, with Follow buttons
- **Players:**
  - Tap-to-load only. A Play control loads the Spotify or Apple Music iframe: the track player during the week, the playlist player after the drop.
  - Remember the chosen service in localStorage, inside try/catch.
  - YouTube Music: link only.
  - Service names as text, no logos.
- **Times:** always in the visitor's selected time zone, with its label.
- **If the content file fails to load:** hide the section quietly (it's editorial, not live data) and log once.

## 9. Share dialog (Stage 3)

**Entry points**
- **Hero "Share" button:** replaces "Share Countdown on X". It opens on the pole card when one is available, else the countdown card.
- **Playlist section "Share" button:** opens on the playlist card.

**Settings**
- Only the card types available right now are offered.
- Format toggle Story/Post: Story by default on phones, Post on desktop.
- The layout comes from the week's content (N8 if there's no entry).

**Pre-render the PNG** when the dialog opens or a setting changes, so every button acts instantly inside the click. Browsers only allow sharing and clipboard writes during a fresh user action.

**Phone** (`navigator.canShare({ files })` is true):
- **"Share image":** `navigator.share({ files: [png], text: caption })`, for Instagram Story/Post, X, WhatsApp, Facebook and others. If the user cancels, stay silent; on any other error, show a message and offer Download.
- **"Copy caption"** and **"Download"**.

**Desktop, or no file sharing:**
- **"Copy image":** use `ClipboardItem` (pass it a Promise, for Safari). Then show "Image copied. Paste it into your post (Ctrl+V / ⌘V)."
- **"Post on X":** opens the X intent with caption and link, directly in the click. Helper text: "Copy the image first, then paste it into the post."
- **"Facebook":** opens the sharer with the link only. Helper text: "Facebook doesn't allow pre-filled text. Copy the caption to paste it."
- **"WhatsApp":** opens wa.me with caption and link.
- **"Download"** and **"Copy link"**.

Hide any button whose capability is missing. Use feature detection, not browser sniffing.

**Captions** (≤ 280 characters, with the link counted as 23):
- countdown: `Qatar Grand Prix: 3 days to lights out. {tagline} #F1 #QatarGP`
- pole: `Pole at the Qatar Grand Prix: {driver} ({team}), 1:19.204. #F1 #QatarGP`
- playlist: `The Qatar Grand Prix race-week playlist is out. {tagline} #F1 #QatarGP`

**Links**
- `{SITE_URL}/?utm_source={x|facebook|whatsapp|share|copy}&utm_medium=social&utm_campaign={countdown|pole|playlist}-{season}-r{round}`, plus `#playlist` for the playlist card.
- `SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin`.

**Dialog behaviour**
- Uses the existing Radix dialog component: focus is trapped and Esc closes it.
- Every button is labelled, and tap targets are ≥ 44 px.
- The preview image has alt text.
- Follows the light/dark tokens.
- The whole feature is lazy-loaded on first open. Report the main-bundle size before and after.

## 10. Hero changes (Stage 3)

- Replace the old X button with "Share", and add "Share pole" when a pole card is available.
- **Tagline:** when the active week has a `tagline`, the hero shows it; otherwise it keeps today's behaviour. Report where the old tagline came from.
- Don't change countdown targets, rounds, time logic, layout or design otherwise.

## 11. Tests (vitest, Stages 1–4)

Pure functions only, using the fixtures from §4 and no live calls. If the inspect plugin in `vite.config.ts` breaks vitest, add a small `vitest.config.ts` with only the `@` alias.

Cover at least:
- **Content schema:** the valid fixture, each invalid rule, and the real file.
- **Playlist state over a timeline:**
  - Monday 04:59 vs 05:00 IST
  - each daily reveal
  - the Friday drop and the end of the week
  - back-to-back weeks (Qatar → Abu Dhabi)
  - an off week, `soon`, and season over
- **Race-week rule:** Qatar (Sunday 21:30 IST), Las Vegas (Sunday morning IST), Miami (Monday 01:30 IST).
- **Countdown formatting:** ≥ 1 day, < 1 day, < 1 hour, live, TBC.
- **Pole:** normal Q3, missing Q3, missing P2 time, long names, and the season count from the fixture.
- **Captions and links:**
  - captions ≤ 280 characters (link = 23)
  - hashtag derivation with accents
  - UTM links
  - embed converters (strip `?si=`, handle Apple album `?i=` and `/song/` links)

## 12. Docs and rules (Stage 5)

**`docs/share-cards/DAILY-UPDATE.md`:** Kiran's runbook for Claude Code (remote control).
- **Covers:**
  - starting a week
  - adding tomorrow's track
  - the Friday drop
  - an off-week message
  - adding a cover (put the file in `public/playlists/`)
- **Includes:** copy-paste message templates.
- **Steps Claude Code follows:**
  1. Edit the JSON.
  2. Run `npm test`, then `npm run build`.
  3. Show the diff and wait for approval.
  4. Commit to `main` as `content: …`.
  5. Push after approval.
  6. End with the links.

**`CLAUDE.md`, add:**
- Editorial content (taglines, playlists, covers, off-week messages) lives only in `public/content/race-weeks.json` and `public/playlists/`, and never contains live facts.
- Content-only updates (those two paths only) may be committed straight to `main` after `npm test` and `npm run build` pass and Kiran approves. The race-weekend code freeze doesn't apply to them.
- Design rule: also no music-service logos and no album art copied by us.
- End every reply with `npm run dev` → http://localhost:3000, the live site https://f1-countdown-pearl.vercel.app, and any preview link.

**`PROJECT_STATUS.md`:** update Done / Accepted / Later / Needs a decision. Add to Later:
- per-race preview image for link previews (og:image from a server function)
- animated countdown video
- playlist archive page
- fan "my pick for pole" cards
- a privacy page that mentions the Spotify and Apple Music embeds

## 13. Phone test before merging

Ask to push `feature/share-cards`, then give Kiran the Vercel preview link and this checklist:
- **Phone:**
  - Share image → Instagram Story
  - Share image → X
  - Share image → WhatsApp
  - Copy caption
  - playlist Play (Spotify and Apple Music)
  - light and dark theme
- **Desktop Chrome:**
  - Copy image, then Post on X, then paste
  - Facebook
  - WhatsApp
  - Download

Merge only after Kiran confirms, and outside a race weekend.

## 14. Report format (end of every stage)

1. What I built (plain language, 3–6 bullets).
2. Files changed.
3. Checks: build, lint and tests, with numbers.
4. What I looked at (samples, screenshots).
5. Decisions I made for you.
6. Limits and open questions.
7. "Commit stage N? (yes / approve all / changes)"
8. Run and links.

## Definition of done

- [ ] All stages committed; build, lint and tests green.
- [ ] Sample PNGs reviewed and clean for every layout, type, format and edge case.
- [ ] No song names on cards; no logos, photos or copied album art.
- [ ] Sharing works on Kiran's phone and on desktop Chrome (§13).
- [ ] Playlist states checked in Studio with fake times.
- [ ] Main bundle grew by no more than ~15 KB gzipped (report if more); share code is in its own chunk.
- [ ] CLAUDE.md, DAILY-UPDATE.md and PROJECT_STATUS.md updated.
- [ ] Merged to `main` only after Kiran's approval, outside a race weekend.

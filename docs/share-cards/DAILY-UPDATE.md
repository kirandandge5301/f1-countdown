# Daily playlist update: runbook

Kiran sends one of the messages below. Claude Code follows the steps at the bottom.

## Times to know (India time)

- Monday 05:00: the week starts, track 1 is revealed.
- Tuesday, Wednesday, Thursday 05:00: tracks 2, 3, 4.
- Friday 05:00: the full playlist drops (10-12 tracks in total).
- A push takes about a minute to go live. Pages left open pick it up within 15 minutes.

**Add each track on the evening before, or on its day.** The file is public: a track added days
early is hidden on the page, but anyone can read it in the file.

## Messages to copy and paste

**Start a week**

> Start the playlist week for round __. Playlist title: __. Tagline (max 45 characters): __.
> Layout: N8 / N7 / N3. Links: Spotify __, Apple Music __, YouTube Music __.
> First track: __ by __, links: __. Follow docs/share-cards/DAILY-UPDATE.md.

**Add tomorrow's track**

> Add tomorrow's track: __ by __. Note (optional, max 80 characters): __.
> Links: Spotify __, Apple Music __, YouTube Music __. Follow docs/share-cards/DAILY-UPDATE.md.

**Friday drop**

> Friday drop. Add the remaining tracks: 1. __ by __ (links) 2. __ by __ (links) …
> Follow docs/share-cards/DAILY-UPDATE.md.

**Off-week message**

> Add an off week starting Monday __ with the message: __. Follow docs/share-cards/DAILY-UPDATE.md.

**Add a cover** (your own square art, .jpg/.png/.webp, at most 600 KB)

> I put __ in public/playlists/. Use it as the cover for this week. Follow docs/share-cards/DAILY-UPDATE.md.

## Steps for Claude Code

1. Start on the latest `main` with a clean tree. Edit only `public/content/race-weeks.json` (and
   `public/playlists/` for a cover).
   - Start a week: `/?studio` → pick the round → "Copy entry JSON" gives the default times. Keep only
     the tracks Kiran has given; remove every "REPLACE ME" (the tests fail otherwise).
   - The week's round must be Jolpica's. `startsAt` is Monday 05:00 IST, `endsAt` 7 days later, `dropAt`
     Friday 05:00 IST, all with `+05:30`. For races that start after midnight IST on Monday (Miami),
     the week is the one before; Studio works it out.
   - Daily tracks: `revealAt` is 05:00 IST on their day. Friday's tracks: `revealAt` equals `dropAt`.
     Keep tracks sorted by `revealAt`.
   - Use only titles, artists, notes and links Kiran gave. Never invent any. Never add live facts
     (times, results, standings).
   - Cover: `"cover": "playlists/<file>"`, only Kiran's own art.
2. Open each link and check it is the right song or playlist. A wrong Apple Music link can show an empty
   grey player with no error.
3. Run `npm test`, then `npm run build`.
4. Show the diff and wait for approval.
5. Commit to `main` as `content: …` (only those two paths).
6. Push after approval.
7. End with the links: `npm run dev` → http://localhost:3000, the live site
   https://f1-countdown-pearl.vercel.app, and any preview link.

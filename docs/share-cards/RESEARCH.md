# Share cards: research (Stage 0)

_Checked on 25 Nov 2026. "Fact" = seen in a live response, a rendered page or a listed source.
"Assumption" = not proven here._

## Blocking finding: fastest in qualifying is not always the pole-sitter

- **Fact:** Jolpica's round 21 (Las Vegas) qualifying has Antonelli P1 (Q3 1:33.893, 0.258s ahead of
  Verstappen). Jolpica's race grid has Verstappen 1st and Antonelli 6th.
- **Fact:** Sky Sports and others report a five-place penalty for Antonelli, with Verstappen on pole.
- **Fact:** across 2026 rounds 1-21 this is the only round where qualifying P1 and grid 1 differ.
- **Fact:** Jolpica's grid positions were read from race results; round 22's results are empty today.
- **Assumption:** Jolpica has no grid until after the race.
- **Effect:** the brief's "POLE POSITION" card would be wrong whenever the fastest driver has a
  penalty, including the Las Vegas fixture the brief uses as its sample. The season count has the
  same problem: Antonelli has 8 qualifying P1s but 7 grid-1 starts.
- **Decision needed before any pole wording is built** (see PLAN.md).

## 1. Jolpica qualifying

- **Fact:** `/{season}/{round}/qualifying.json` has `MRData.RaceTable.Races[0].QualifyingResults[]` with
  `position`, `Driver` (`givenName`, `familyName`, `driverId`, `code`), `Constructor.name`, `Q1`, `Q2`, `Q3`.
  In the fixture, a driver without a time in a session has **no such key**.
- **Fact:** an unpublished round (22) and a round that doesn't exist (30) both return HTTP 200 with
  `Races: []`. So empty means "nothing published"; only a failed request is an error.
- **Fact:** CORS is open (`*`) and responses say `max-age=600`, so a card can appear about 10 min late.
- **Fact:** names carry accents (Hülkenberg, Pérez); teams read e.g. "RB F1 Team", "Alpine F1 Team".

## 2. Season P1 list

- **Fact:** `/2026/qualifying/1.json?limit=100` has P1 for all 21 rounds, but returns **43 rows**, including
  drivers with `position` 2-8. Code must keep only `position === "1"`.
- **Assumption:** the extra rows are drivers who were fastest in one of Q1/Q2/Q3.

## 3. Embeds (rendered in Chrome, signed out)

| Link | Embed | Width x height | Result |
|---|---|---|---|
| Spotify track | `open.spotify.com/embed/track/{id}` | 100% x 152 | loads |
| Spotify playlist | `open.spotify.com/embed/playlist/{id}` | 100% x 352 | loads |
| Apple album `?i=` | same path on `embed.music.apple.com` | 100% x 175 | loads |
| Apple `/song/{id}`, `/song/{name}/{id}` | same path on `embed.music.apple.com` | 100% x 175 | loads |
| Apple playlist | same path on `embed.music.apple.com` | 100% x 450 | loads |
| YouTube Music | refuses framing (`X-Frame-Options: SAMEORIGIN`) | - | link only |

- **Fact:** Spotify `allow` (from its oEmbed): `autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture`.
- Apple `allow` used in the test: `autoplay *; encrypted-media *`.
- **Fact:** signed out, Spotify shows "Preview" and Apple shows "Sign In".
- **Fact:** two Apple song IDs I guessed showed a blank grey box, with no error; a real ID loaded.
  Links must be checked before publishing.
- Not tested: pressing Play, and playback on a phone (section 13).

## 4. Sharing

Browser support, from MDN's browser-compat-data (first version):

| Feature | Chrome | Android Chrome | Safari / iOS | Firefox |
|---|---|---|---|---|
| `navigator.share` | 128 | 61 | 12.1 | desktop: flag only; Android 79 |
| `navigator.canShare` | 128 | 75 | 14 | desktop: flag only; Android 96 |
| `clipboard.write` | 76 | 76 | 13.1 | 127 |
| `new ClipboardItem` | 133 | 98 | 13.1 | 127 |

- The `ClipboardItem` row is the first entry MDN lists; earlier Chrome versions may have partial support.
- **Fact:** share needs a fresh click and HTTPS. Cancelling rejects with `AbortError`; no fresh click
  gives `NotAllowedError`. MDN lists PNG as usually shareable, to be confirmed with `canShare`.
- **Assumption:** clipboard writing needs a fresh click too (MDN's page is silent).
- **Fact:** headless desktop Chrome on Windows also answers `canShare({ files })` = true, so it does not
  mean "phone". Plan: show the phone buttons only if `matchMedia('(pointer: coarse)')` matches as well.
- **Fact:** the X intent, Facebook sharer and wa.me links all end at HTTP 200. Signed out, X redirects to
  login and keeps the text. The sharer link is sent with a URL only.
- **Not tested:** real posting from signed-in apps, and which apps keep the caption (section 13).

## 5. Canvas, safe zones, contrast

- **Fact:** `document.fonts.load()` resolves with the loaded faces and rejects if one fails. MDN does not
  say what happens with no match, so the code will treat an empty list as a failure.
- Instagram publishes no official zone for ordinary Stories; guides say about 250 px top and bottom,
  while Meta's ad guidance is about 14% / 20%. The brief's 250-1670 fits the pixel guidance.
- **Computed contrast:**
  - white on #808080: 3.95 (large text only)
  - #808080 on white: 3.95, **fails** for small text; #767676 gives 4.54
  - #808080 on #0A0A0A: 5.01
  - red on white: 4.97; red on black: 3.99 (large title only)
- **Fact:** Instrument Serif Italic (71,592 bytes) and its OFL.txt are available from google/fonts.

## Existing code

- The hero tagline "The roar is coming." and the old X button are hard-coded in
  `src/sections/NextRaceSection.tsx`. The button's text advertises gpcountdown.com, which does not resolve.
- Nav links are in `src/components/Header.tsx`.
- `origin/feature/premium-social-sharing` has a Canvas renderer (X and Instagram formats). Only its
  general approach is reusable.
- Baseline: main JS 83.34 kB gzip, CSS 15.05 kB gzip, lint clean.

## Sources

- The Jolpica endpoints above; responses saved in `fixtures/`
- https://www.skysports.com/f1/news/13614575/las-vegas-gp-kimi-antonelli-fastest-but-max-verstappen-on-pole-from-george-russell-after-dramatic-qualifying
- https://www.f1-fansite.com/f1-result/qualifying-results-report-2026-las-vegas-f1-gp/
- https://www.formula1.com/en/latest/article/verstappen-claims-p1-in-belgium-qualifying-ahead-of-grid-penalty-as-he-heads.4G7gZvZk3905EWPcv7fdNc (2024 precedent)
- https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
- https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/write
- https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/load
- https://github.com/mdn/browser-compat-data
- https://superprofile.bio/guides/instagram-story-size.md (and similar guides, search summary only)
- https://github.com/google/fonts/tree/main/ofl/instrumentserif

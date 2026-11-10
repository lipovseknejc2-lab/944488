# Atelier: rules for Claude Code

We work on **one app only: Atelier**, the team-work app (notes, projects, groups, chat, focus). It is one self-contained HTML file that works offline on an iPhone and is published on GitHub Pages.

- **Live:** https://lipovseknejc2-lab.github.io/944488/atelier/
- **Source:** `src/atelier/` (read `src/atelier/NOTES.md` first)
- **Published folder:** `atelier/` (`index.html`, `sw.js`, `manifest.webmanifest`, icons)
- **Design:** `DESIGN.md` (read it before any visual change)

The repository also contains other apps (the site root and the other folders). **Do not touch them**, unless Nejc explicitly asks.

## The four rules that matter most
1. **Never simplify, remove or downgrade.** Keep every feature, screen, animation, drawing and detail. Changes add or improve. A rewrite must do everything the old version did.
2. **Never make the design worse.** Follow `DESIGN.md` exactly. New screens must look like they were always part of Atelier: same tokens, glass, line icons, gesture characters, handwriting accents and motion. When unsure, copy an existing Atelier component.
3. **Never lose data.** Saved data: localStorage `atelier-v1` and `atelier-backup`, plus IndexedDB `atelier` (files, drawings, voice). Never rename them. If the data shape changes, write a migration so old saves keep working.
   The profile (first name, surname, student or working, school or work, email) is encrypted with AES-GCM 256 in `S.me.vault`; only the first name stays in plain text. The key is a non-extractable CryptoKey in IndexedDB under `key:profile` (or localStorage `atelier-key` where IndexedDB is blocked). Never delete or rename the key, never write the profile in plain text, and use `storeProfile()` to change it. Encryption is never mentioned in the interface.
4. **Test everything, publish, then give the link.** Every update ends with the live link.

## How Atelier is built
- The modules in `src/atelier/` are joined in this order by `build.py`: `art.js` (icons, characters, avatars, posters, clock), `core.js` (state, storage, knots meter, router, UI kit), `people.js` (bot teammates, onboarding), `today.js` (Today, ledger, quick panel, voice), `focus.js`, `notes.js`, `chat.js` (chat, groups, people), `projects.js` (tasks, ideas, notes, files, drawing boards, inspiration, table and chart), `study.js` (flashcards, exams, study goal, subjects), `pulse.js` (the Pulse motivation check, insights, nudges), `school.js` (timetable, grades and goals, practice quizzes, study plans), `widgets.js` (chat widgets and their editor), `rewards.js` (themes, frames, quotes, profile, collection), `you.js` (You, posters, settings, boot). `shell.html` holds all CSS and the page shell.
- `python3 build.py` writes `dist/atelier.html` with the fonts (Newsreader, Instrument Sans, Caveat) embedded. Never edit `dist/` or `atelier/index.html` by hand.
- Today, rebuilding from `src/atelier/` reproduces the live `atelier/index.html` byte for byte.

## Things that must keep working
- **Navigation** is an in-memory router (`go()`, `redirect()`, plus a click handler for `a[href^="#"]`). It must not depend on the address bar, because phone previews block it. Use `go('page')`, never `location.hash=`.
- **Storage** goes through `LS` (falls back to memory when blocked) and IndexedDB (`IDB`). Wrap new storage in try/catch.
- **Knots** are usage tracking: call `use('action')` for every new action and add it to `ACT` in `core.js`. They appear only on the You page.
- **Ledger:** important actions call `led(kind, text, {ref})` so they show on Today.
- **Bots:** teammates reply in chat, vote on ideas and pick up tasks (`people.js`). New collaborative features should let bots react too (add lines to `LINES` for new shared kinds).
- **Sharing:** anything can be shared into any conversation with `shareTo(att)` or `sendMsg(c, text, att)`. Shared kinds live in `ATT` (`chat.js`): note, project, file, photo, doc, focus, day, agenda, progress. Photos and files are blobs in IndexedDB under `c…` keys; `dropBlob()` frees them when the last message using them is deleted.
- **Sheets** that start something (recording, timers) register `onSheetClose(fn)` so closing the sheet in any way stops it.
- **Focus timer** keeps real end times (`endAt`). After the phone was locked or the app closed, `catchUp()` replays every switch from the moment each phase really ended and credits only real focus time. Never reset an overdue timer to now.
- **Deep mode** (`enterZen()`): true black, dim text, only timer and phase, screen kept on with the Wake Lock API, a small pixel shift each minute. `S.focus.zen` brings it back after a reload.
- **Guided reset** (`reset.js`, `openReset()`): a two-to-three-minute break routine of one breathing technique, two stretches (three on a long break) with a "Just breathe" pause (only the circle) between them, and a 20-second far look, shuffled so it never repeats the last mix (`S.settings.lastReset`). It has a breathing orb and a stick figure posed by joint angles (`rigPaths`) that eases every frame. It uses Deep mode black. It shows as a card on Focus during breaks and as a quiet pill (`#zRs`) in Deep mode. Saved in `S.resets`. The figure has real proportions (shoulders, hips, elbows, knees, hands, feet, curved spine), a front and a side view (`side`), stands on the floor by itself, and uses `rIK` for hand positions. Soft tones (`RSND`, muted with `S.settings.resetSound`) mark each step, the moment to look back after the far look, breath switches and the end.
- **Alerts:** `notifyFocus()` shows a system notification only when Atelier is in the background (needs permission; on iPhone the app must be on the Home Screen). For a locked phone, `calAlerts()` hands the phone's calendar an .ics file with an alert at every switch. A web app on GitHub Pages cannot schedule its own notifications or show a lock-screen live timer.
- **Two spaces:** `S.settings.space` is `student` or `work` (switched on the You page). Each has its own tabs (`tabsNow()`), Today summary (`spaceHero()`), quick actions (`ACTS`) and wording. New features should fit both, or show only where they belong.
- **Tab bar** is built once (`nav()`); afterwards only the active tab, the sliding highlight and the badge change. Never rebuild it on a new message, or it jumps.
- **Themes:** every theme only sets design tokens (`SKINS` in `rewards.js` generates the CSS). Every new feature must use the tokens (`--bg`, `--card`, `--text`, `--accent`, `--line`, `--fill` and so on), never raw colours, so it looks right in every theme, light and dark; the tests open every screen in every theme. New themes can be added over time, always priced above the ones before.
- **Knots** use `KSCALE` (8): a normal full day is about 1,600 knots. Themes and frames unlock at all-time totals and are never spent; the top theme is over a million (about two years). `fixData()` scales older saves once.
- **Logo (Thread):** `MARK_A` (the symmetrical A), `MARK_B` (the clay thread crossbar) and `MARK_DOT` (its end) in `art.js` are the only source; the splash, posters, widgets and `atelier/icon.svg` plus the PNG icons must always use the current mark.
- **Widgets** (`widgets.js`): Atelier's branded live cards in chat, with size, font and surface the user picks and that are remembered per kind. Anything shared as a card should be a widget kind.
- **One design language:** new screens use the widget grammar and the glass material described in `DESIGN.md` (tiles, `.lab` label rows, big tabular numbers, `--glt`/`--gl-hi` glass, `--spring` presses).
- **Pulse** (`pulse.js`, `S.pulse`): the 40-second motivation check (wheel of feelings with intensity rings, energy, eight statements) scored with Temporal Motivation Theory and Self-Determination Theory; the day's percentage is a weighted mean that favours the latest check. Feeling in the Palette opens it; the quick feeling check-in stays as "Just log a feeling".
- **School** (`school.js`): classes in `S.study.classes` fill the agenda by themselves (`classItems()`, virtual, never saved as agenda items); grades in `S.study.grades` with goals and a scale (1 to 5 by default); quizzes saved per deck; study plans in `S.study.plans` own their agenda items.
- **The Palette** (quick panel): floats over pages and is never part of the layout. It is open by itself only on Today; elsewhere it is a handle.
- **No emojis** anywhere in the text. Use line icons from `art.js`.
- **Offline:** `atelier/sw.js` may only delete caches starting with `atelier-`.

## Testing before every publish
Nejc's preference: for a normal update, run a quick test of the changed feature (a focused Playwright script on an iPhone-sized viewport, light and dark, no script errors). Run the full suite below only when he asks for a big testing cycle.

`bash src/atelier/tests/run.sh` builds Atelier and runs everything: features (270 checks), phone taps in three setups (183 checks), stress and crash (heavy data plus 400 random taps), and offline (7 checks). It needs node with playwright (`npm i playwright`) and python3.
- All tests must pass with zero errors. Add checks for every new feature to `tests/feat.js` and `tests/phone.js`.
- Look at screenshots of every changed screen on an iPhone-sized viewport, in light and dark, and compare them with `DESIGN.md`. If it looks plainer or less finished than before, it is not done.
- No screen slower than about 100 ms with normal data. Memory flat. Animations smooth.

## Publishing and finishing
1. `cd src/atelier && python3 build.py && cp dist/atelier.html ../../atelier/index.html`
2. Raise `CACHE` in `atelier/sw.js` (for example `atelier-v1` to `atelier-v2`) so phones update.
3. `git pull --rebase`, commit on `main` with a clear message, `git push`.
4. Wait until `gh run list -L 1` shows the Pages deployment completed successfully.
5. Reply to Nejc with a short summary of what changed and the link **https://lipovseknejc2-lab.github.io/944488/atelier/**, plus "open it once online and it updates".

## Writing style
English. Short, warm, plain sentences. No emojis.

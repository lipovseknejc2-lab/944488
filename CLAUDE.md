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
   The profile (first name, surname, student or working, school or work, email) is encrypted with AES-GCM 256 in `S.me.vault`; only the first name stays in plain text. The key is a non-extractable CryptoKey in IndexedDB under `key:profile` (or localStorage `atelier-key` where IndexedDB is blocked). Never delete or rename the key, never write the profile in plain text, and use `storeProfile()` to change it.
4. **Test everything, publish, then give the link.** Every update ends with the live link.

## How Atelier is built
- The modules in `src/atelier/` are joined in this order by `build.py`: `art.js` (icons, characters, avatars, posters, clock), `core.js` (state, storage, knots meter, router, UI kit), `people.js` (bot teammates, onboarding), `today.js` (Today, ledger, quick panel, voice), `focus.js`, `notes.js`, `chat.js` (chat, groups, people), `projects.js` (tasks, ideas, notes, files, drawing boards, inspiration, table and chart), `you.js` (You, posters, settings, boot). `shell.html` holds all CSS and the page shell.
- `python3 build.py` writes `dist/atelier.html` with the fonts (Newsreader, Instrument Sans, Caveat) embedded. Never edit `dist/` or `atelier/index.html` by hand.
- Today, rebuilding from `src/atelier/` reproduces the live `atelier/index.html` byte for byte.

## Things that must keep working
- **Navigation** is an in-memory router (`go()`, `redirect()`, plus a click handler for `a[href^="#"]`). It must not depend on the address bar, because phone previews block it. Use `go('page')`, never `location.hash=`.
- **Storage** goes through `LS` (falls back to memory when blocked) and IndexedDB (`IDB`). Wrap new storage in try/catch.
- **Knots** are usage tracking: call `use('action')` for every new action and add it to `ACT` in `core.js`. They appear only on the You page.
- **Ledger:** important actions call `led(kind, text, {ref})` so they show on Today.
- **Bots:** teammates reply in chat, vote on ideas and pick up tasks (`people.js`). New collaborative features should let bots react too.
- **Quick panel:** floats over pages and is never part of the layout. It is open by itself only on Today; elsewhere it is a handle.
- **No emojis** anywhere in the text. Use line icons from `art.js`.
- **Offline:** `atelier/sw.js` may only delete caches starting with `atelier-`.

## Testing before every publish
`bash src/atelier/tests/run.sh` builds Atelier and runs everything: features (103 checks), phone taps in three setups (117 checks), stress and crash (heavy data plus 400 random taps), and offline (7 checks). It needs node with playwright (`npm i playwright`) and python3.
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

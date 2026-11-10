# Atelier

Light, professional team-work app: Today (week, message of the day, ledger, feelings, floating quick panel), Focus timers, Notes, Projects (tasks, ideas, files, drawing boards, inspiration, table and chart), Chat, Groups and People with bot teammates, You (knots usage, posters, settings). In-memory router so it works in sandboxed previews. No emojis anywhere.

- **Live:** https://lipovseknejc2-lab.github.io/944488/atelier/
- **Published in the repository at:** `atelier/`
- **Saved data:** `atelier-v1 (also atelier-backup); files, drawings and voice memos in IndexedDB "atelier"`. Never rename these keys; people keep their progress in them.
- **Chat and groups:** tap a chat header for group info (members, active projects with progress, pinned, photos, files, shared notes) or person info. Press and hold a message to pin, copy, forward or delete. The share sheet sends photos, files, notes, projects, focus, your day and your agenda as cards. Groups have a kind, icon, colour, cover drawing and a quiet mode (`g.kind`, `g.icon`, `g.fig`, `g.mute`).
- **Today agenda:** `S.agenda` items `{id, d, t, title, note, pid, done}`; any day of the week can be planned (dots in the week row); shareable.
- **Project progress:** automatic from tasks and milestones (a milestone weighs two tasks) or set by hand (`p.pmode`, `p.pct`); milestones in `p.miles`; daily history in `p.hist` for the chart; updates can be posted to the project's groups.
- **You:** "How you work" shows an efficiency score (making share, plans done, active days), streak, weekly change, focus hours, tasks, shares, peak hour and two rhythm charts, all from data already tracked.
- **Focus:** exact catch-up after time away (`catchUp()`), Deep mode (`enterZen()`), alerts while open and calendar alerts for a locked phone (`alertsSheet()`).
- **Study** (`study.js`, `S.study`): daily focus goal and streak; exams and deadlines with countdowns and "Plan study blocks" into the agenda; flashcard decks with spaced repetition (boxes 0 to 6, back after 0, 1, 2, 4, 8, 16, 32 days; Again, Hard, Good, Easy); cards from note lines like `term - meaning`; subjects this week from focus labels; decks can be shared in chat.
- **Design:** glass material and the widget grammar on every surface; notes are tinted tiles; the quick panel is called the Palette; the logo is Thread (an A with a clay thread crossbar ending in a dot).
- **Spaces:** Student (tabs Today, Focus, Study, Notes, Chat, You; Study also holds projects) and Work (Today, Focus, Notes, Projects, Chat, You). Set from the account at sign-up, switched on the You page.
- **Collection** (`rewards.js`): 11 themes from Clay (free) to Grand atelier (1,100,000 knots) and 6 profile frames from 220,000 to 1,300,000, unlocked by all-time knots, never spent. Profiles (`#profile`, `person:`) show a styled quote (font, look, colour).
- **Widgets** (`widgets.js`): Focus, My day, Agenda, Project, Flashcards, Countdown, Quote and Photo, each with Small or Wide, Sans, Serif or Hand, and Glass, Tint or Ink. Styles live in `S.widgets`.
- **Account and encryption:** the account screen asks for first name, surname, student or working, school or work, and email. The profile is sealed with AES-GCM 256 (fresh IV each save) into `S.me.vault`; the key is a non-extractable CryptoKey in IndexedDB `key:profile`, or localStorage `atelier-key` if IndexedDB is blocked. The decrypted profile lives only in memory (`PROFILE`). Older saves move their name and role into the vault on first start. Backups carry the profile as `_profile` so they can be restored on another device, where it is sealed again with that device's key.
- **Offline cache prefix:** `atelier-`. This app's worker may only delete caches that start with it.

## Build and publish
```
cd src/atelier
python3 build.py      # writes dist/, one self-contained HTML file with fonts embedded
```
Publish: copy `dist/atelier.html` to `atelier/index.html`. `sw.js`, the manifest and icons are already in `atelier/`.

After publishing, raise the version in this app's `sw.js` (for example `atelier-v3` to `atelier-v4`) so phones download the update.

## Files
JS build order: `art.js`, `core.js`, `people.js`, `today.js`, `focus.js`, `notes.js`, `chat.js`, `projects.js`, `study.js`, `widgets.js`, `rewards.js`, `you.js`

| File | Role | Notes |
|---|---|---|
| `art.js` | build order 1 |  |
| `build.py` | build script |  |
| `chat.js` | build order 7 | CHAT, GROUPS, PEOPLE |
| `core.js` | build order 2 | ATELIER · CORE: state, storage, usage meter, router, UI kit |
| `focus.js` | build order 5 | FOCUS: timers for working and studying |
| `notes.js` | build order 6 | NOTES |
| `people.js` | build order 3 | TEAMMATES (bots) |
| `projects.js` | build order 8 | PROJECTS: small to big, personal or shared |
| `shell.html` | shell: CSS and HTML |  |
| `today.js` | build order 4 | TODAY: week, live focus, message of the day, greeting, ledger, quick actions |
| `you.js` | build order 9 | YOU: account, knots usage, posters, settings |

## Tests
`bash tests/run.sh` builds Atelier and runs every check: features, phone taps, stress and crash, offline. Screenshots from `tests/look.js` go to `tests/shots/`.

`fonts/` (and `f/`) hold only the font files this build embeds. `dist/` is generated; do not edit it.

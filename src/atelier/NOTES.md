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
- **Pulse:** motivation check with a diagnosis and three recommendations that open the right tool; Today shows the day's motivation and a 7-day spark; `#pulse` shows any day and two weeks.
- **Study tools:** timetable (Today shows the next class; classes appear in the agenda), grades and goals (weighted averages, the mark you need next), practice quizzes (choose or type, forgiving small slips), study plan builder (topics, spaced reviews, final review into the agenda).
- **Pulse extras:** insights after 5 days of checks, a smart nudge on Today after a low check with a "did it help" follow-up, and a Pulse widget.
- **Design:** glass material and the widget grammar on every surface; notes are tinted tiles; the quick panel is called the Palette; the logo is Thread (an A with a clay thread crossbar ending in a dot).
- **Spaces:** both spaces have the tabs Today, Focus, Flow, Chat, You. Flow is called Study flow or Work flow: notes, the agenda with a week strip, materials (uploaded files) and, by space, study (timetable, grades, exams, flashcards) or projects. Set from the account at sign-up, switched on the You page.
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

## Guided reset
`reset.js` comes after `focus.js`. Research basis: cyclic sighing (Balban 2023), slow breathing near 6 a minute (Lehrer and Gevirtz 2014), micro-breaks with movement (Albulescu 2022), 20-20-20 and green views (Lee 2015), phone-free breaks. RBREATH and RSTRETCH are data: add a technique by adding an entry (stretch keyframes are [time, pose, cue]). The animation loop only changes attributes and transforms. Ten stretches: neck, shoulder rolls (side view), reach up, side bend (diamond arms), chest opener, calf raises, forward fold, chair squats, arm circles and chin tucks (all side view). Stretch keyframes carry `o`, the breathing circle size, so the circle breathes with the movement.

## Files
JS build order: `art.js`, `core.js`, `people.js`, `today.js`, `focus.js`, `reset.js`, `notes.js`, `flow.js`, `chat.js`, `projects.js`, `study.js`, `pulse.js`, `school.js`, `widgets.js`, `rewards.js`, `you.js`

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

## Notes as boards (notes.js)
- A note is a page you arrange with your fingers: `note.board={v:1,bg,blocks,links}` on a 360-unit stage (`BW`) scaled to the screen.
- Parts (`blocks`): text (body, heading, quote, hand), checklist, thought chain (Thought, Because, So, Next), sticky, pinned sketch (strokes in the part's own units) and motion (pulse, flow, cycle, grow, spark, orbit; only transform and opacity animate).
- Arrows (`links`) join two parts: curve, straight or elbow; solid, dashed or hand drawn; arrow, both ends, dot or line; six colours. Drag the clay knob from a selected part, or use Arrow and tap two parts. Arrows never run under another part: when the simple line is blocked, `routeLink()` finds a way around on an 8-unit grid (`aStar()`, turns cost extra), leaves and enters through the middle of a side, then draws it rounded, pulled tight (straight) or as an elbow. Routes are cached per layout (`st._rc`).
- Move with the grip or by pressing and holding a part; resize from the corner; undo and redo keep 50 steps. Backgrounds: plain, dots, grid, lines, paper.
- `n.body` is always rewritten from the board (`syncBody`), so search, previews and older code keep working. Old notes become boards when first opened (`ensureBoard`, `boardFrom`, stacked by real height).
- `miniBoard(n,h,cls)` draws a still preview that scales itself (used by note cards and the note widget). The note widget in chat opens up in place on a tap, its checklists can be ticked there, and the unfold mark opens the note.

## Flow (flow.js)
- `pFlow()`: counts, a create strip (Note, Agenda, Upload, plus Exam and Flashcards or Project and Task), recent notes, a week strip with the agenda, materials and the study or projects section.
- Materials: `S.materials=[{id,name,type,size,fid,tag,at}]`, blobs in IndexedDB under `m…` (never `c…`, so chat clean-up never touches them). Sending one to chat copies the blob to a new `c…` key. `pMaterials()` lists, searches and filters by tag.

## Groups as servers (groups.js)
- Chat has three rounded section tabs: Messages (direct chats, with a strip of groups on top), Groups and People.
- A group is private (schoolwork, friends, small teams) or official (a company or a school: `g.org` with name, kind, website and email; `g.verify` is `pending` until verified, and the verified badge shows only then). The Atelier Community group, which Atelier runs itself, is the one verified group and can be joined from Discover.
- Every group has a picture (an icon or an uploaded photo), a banner (thread, dots, rings, grid, wash, drawing or an uploaded picture), roles (Owner and Member to start; new roles with a colour and what they can do: manage, channels, roles, announce, pin, invite) and categories with channels.
- Channel types (`CHT`): Talk, Announcements (only roles with announce post), Files (shelf of files, upload), Photos, Projects (only projects), Notes (shared note boards), Ideas (votes; bots vote too), Plans (agenda, day and countdown widgets) and Everything (one feed of all that is attached in every channel, with filters). Every channel shows what is attached in it (the folder button).
- Layout: on phones the channel opens full screen, channels slide in from the left and members (grouped by role, filter by role) from the right. From 1100 px wide, channels, chat and members sit side by side.
- `pServer(gid, chId)` is the route `g:gid:chId`; `group:gid` is the group page with roles, channels, verification, plugins (coming soon), projects, media and notes. Links to `c:` chats of groups open their channel.

## Plugins and reactions (plugins.js, ../plugkit/pk.js)
- The engine `PK` is shared with Atelier Plugins (the desktop hub at `atelier-plugins/`). A plugin is nodes (`graph`) or code (`code`), with a name, picture, size (small or big) and version.
- In a group, plugins run on events: join, message, keyword, command, reaction, daily (first message of the day), timer (every few minutes while open), file, role and install. They answer as themselves (the Plugin tag), react, pin, give roles, file copies in channels, make channels and keep values like coins.
- Starters: Welcome, Coins (daily coins, /coins, /top, /give, stars pay a coin), Spotlight (/leader once a day) and File helper (describes files, files copies in #files).
- Plugin messages render as widgets (`PK.plCard`, class `.plw` in a `.bub.plb`): a `card` (the Send a widget node or `a.card()`) gives a title, a big value, a unit, text and a tone; plain text with a ranked list or a short stat is turned into a widget by `PK.guess`. The starters (1.1) answer with widgets.
- Message text goes through `PK.fmt`: `/commands` become glowing `.cmdt` chips and `#channels` turn blue (`.chm`). The composer gets `cmdin` while it starts with `/`.
- The Plugins page (from Groups) lists them, scans QR codes, opens pasted codes and files. A group's page lists its plugins with switches.
- Reactions: press and hold a message; ten drawn reactions or any emoji from the keyboard.

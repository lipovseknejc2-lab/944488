# Atelier Plugins (the desktop hub)

A desktop web app for building plugins for Atelier groups. Published at `atelier-plugins/` on the same site as Atelier.

- **Build:** `python3 build.py` writes `dist/hub.html` (fonts from `../atelier/`, the shared engine from `../plugkit/`, `../atelier/art.js` for icons, figures and the mark). Copy it to `../../atelier-plugins/index.html`.
- **Files:** `scenes.js` (the illustrated welcome tour: Nodes or code, A test bench, Straight to your phone; arrows, dots, auto-advance every 6.5 s unless paused or switched off; the plaque scene), `account.js` (License tab, license codes, node points section, Settings), `hub.js` (state, sign in, license step, shell, dashboard, library, public), `studio.js` (node canvas, inspector, checks, written code, code editor, API reference), `bench.js` (test bench, sending, importing), `shell.html` (all CSS, dark workshop look on Atelier's tokens), `boot.js`.
- **Saved:** localStorage `atelier-plugins-v1` = `{acct, lic{no,at,ok,codes,log,seat}, plugins, stats, log, sims, np, set}`. Never rename it. `hfix()` fills in missing parts for older saves.
- **License:** the license step shows a character holding the plaque, then Start creating. The License tab has the key (hidden until shown), usage meters, up to 3 computers with codes (`APL1.` plus base64 JSON, shown as a QR code, redeem, take back), a license file to download or restore, and a log.
- **Node points:** `np(kind)` with `NPT` (node 2, wire 1, plugin 10, test 1, send 5, import 3, public 8, code 3, daily 5); levels Apprentice, Builder (200), Engineer (1000), Architect (5000), Master builder (20000). The sidebar pill shows the total; the dashboard shows today, the week and where they came from.
- **Settings:** accent, surface (charcoal, graphite, walnut, paper; set on `data-surface`), initials colour, grid, wire style, block width, snapping, code text size, tour auto play, calm motion, profile. `applySet()` applies them on boot.
- **Scene classes:** keep scene class names distinct from app classes (`sbench`, `ppb`, `bkt2`, `cacc` were renamed because `.bench`, `.pb`, `.bt2` already exist).
- **Plugin widgets:** plugin messages on the bench render as `PK.plCard` widgets, and `/commands` glow (`PK.fmt`), the same as in Atelier.
- **Sending to phones:** `PK.encode` packs a plugin (deflate, base64url); `PK.parts` splits it into QR codes of 380 characters that cycle on screen; Atelier collects them in any order. Also: copy the code, download a file, a link for small plugins, and the inbox (`atelier-plugin-inbox`) that Atelier on the same computer reads by itself.
- **Engine rules:** node plugins and coded plugins use the same API (`a.reply`, `a.add`, `a.pick` and so on); the nodes write code with `PK.gen`. Coded plugins only run in the sealed sandbox.
- **Honesty:** counts show what left this computer (sends, test runs). Real installs and plugins from other builders need the online step; the dashboard and Public plugins say so.
- **Tests:** `tests/hub.js` (the hub alone) and `tests/bridge.js` (hub and Atelier together, QR codes read both ways). Both run from `src/atelier/tests/run.sh`.

## One account, private plugins, bots (November 2026)
- **Account:** `acctShared()`/`acctWrite()` keep localStorage `atelier-account` ({id, name, at, apps}) in step with `H.acct.acc`. Sign in shows "Continue as" when Atelier on this site has an account.
- **License:** no step after sign in. `licensed()` decides. `vClaim()` shows the claim card and what a license changes; `claimLicense()` opens the thumbs-up (`vLicense`, `cheerScene`) and lifts the lock from private edits made before.
- **Your groups** (`groups.js`): `groupSrc()` merges Atelier's save on this computer (read only, groups you own or manage) with `H.links` (an `ATL1` account link scanned with `importPlugin('link')`). `editFor(gid,pid)` makes a private edit (`priv`, `from`, `base`, and `lock` without a license); `privFor` makes a plugin private for one group; `addToGroup` sends one there. `H.bases` keeps the plugins edits were made from, for `privCheck`.
- **Studio:** `lockOn(pl)` turns on the limits: the name and picture stay, blocks and wires it came with cannot be deleted, `lockWhy` refuses blocks that need a license and anything past six new ones, the limits bar shows the count. The plugin panel edits category, tags, how to and rules; Public needs a license and keeps the credit.
- **Bots:** `V.bot` picks the plugin or a bot; `tgt()` and `nodesOf()` follow it, so the canvas, code mode, undo and checks work on the bot. `botAdd`, `botPanel` (name, picture, what it does, where it works, on), `botCopyTo`, `botCode`/`botPaste` (`ATB1.` codes).
- **Bench:** `PK.runAll`; bot messages carry `as`; blur and pop-ups show; a gallery channel; a hideable Bots list.
- **Public plugins:** search over names, commands, tags, bots and authors; categories, build, size, Bots and Commands filters; sort; a featured plugin; `pubInfo` details.
- **Tour:** objects only. `KF` writes the keyframes for one 9-second loop; `alt` marks later phases so a still scene never overlaps. A slide restarts when it comes into view.

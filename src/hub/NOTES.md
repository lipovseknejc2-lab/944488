# Atelier Plugins (the desktop hub)

A desktop web app for building plugins for Atelier groups. Published at `atelier-plugins/` on the same site as Atelier.

- **Build:** `python3 build.py` writes `dist/hub.html` (fonts from `../atelier/`, the shared engine from `../plugkit/`, `../atelier/art.js` for icons, figures and the mark). Copy it to `../../atelier-plugins/index.html`.
- **Files:** `hub.js` (state, sign in, license, shell, dashboard, library, public), `studio.js` (node canvas, inspector, checks, written code, code editor, API reference), `bench.js` (test bench, sending, importing), `shell.html` (all CSS, dark workshop look on Atelier's tokens), `boot.js`.
- **Saved:** localStorage `atelier-plugins-v1` = `{acct, lic, plugins, stats, log, sims}`. Never rename it.
- **Sending to phones:** `PK.encode` packs a plugin (deflate, base64url); `PK.parts` splits it into QR codes of 380 characters that cycle on screen; Atelier collects them in any order. Also: copy the code, download a file, a link for small plugins, and the inbox (`atelier-plugin-inbox`) that Atelier on the same computer reads by itself.
- **Engine rules:** node plugins and coded plugins use the same API (`a.reply`, `a.add`, `a.pick` and so on); the nodes write code with `PK.gen`. Coded plugins only run in the sealed sandbox.
- **Honesty:** counts show what left this computer (sends, test runs). Real installs and plugins from other builders need the online step; the dashboard and Public plugins say so.
- **Tests:** `tests/hub.js` (the hub alone) and `tests/bridge.js` (hub and Atelier together, QR codes read both ways). Both run from `src/atelier/tests/run.sh`.

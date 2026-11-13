# Mintora: notes for building

Mintora is a desktop web app for making, selling and growing digital products. One self-contained HTML file, published at `/mintora/` on GitHub Pages.

- **Build:** `python3 build.py` writes `dist/mintora.html` (fonts embedded). Publish by copying it to `../../mintora/index.html` with `manifest.webmanifest`, `icon.svg` and `sw.js`, and raise `CACHE` in `sw.js`.
- **Test:** `bash tests/run.sh` (Playwright, 145 checks: every feature, every screen in light and dark at two widths, speed, heavy data, random taps, no outside requests).
- **Data:** localStorage `mintora-v1` and `mintora-backup`. Change the shape only with a step in `migrate()` in `core.js`.
- **Modules** (joined in this order): `core.js` state, storage, router, credits · `art.js` icons, the mark, gesture figures, product covers · `ui.js` sidebar, toolbar, overlays, ⌘K palette, charts, shortcuts · `data.js` the seeded workspace, live sales, every number and the performance score · `dash.js` · `products.js` · `store.js` storefronts, editor, live page, checkout · `sales.js` analytics and sales · `work.js` roadmap, people, messages · `hubs.js` · `credits.js` · `blueprint.js` license, Plugin Studio, Design Studio, reference · `settings.js` · `boot.js`.
- **Brand:** the mark is a rounded hexagon (the product box) with a monoline M and a mint spark (`MARK` in `art.js`). Type: Space Grotesk (display), Instrument Sans (text), JetBrains Mono (numbers, code, Blueprint), Caveat (small handwritten accents). Mint `#12C48B` and violet `#6D5DFC`. Blueprint mode turns the app into a technical drawing (`body.bp`).
- **Rules:** every colour is a token in `shell.html` (light, dark and Blueprint). Navigation goes through `go()`. Every action that earns credits calls `earn()`; every spend calls `spend()`. Credits have no cap.

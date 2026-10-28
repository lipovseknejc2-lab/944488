# Leeway

Plan the whole trip in one place: pick a destination, build a multi-stop route, and Leeway prices flights from every nearby airport (ground transport included), stays, transfers between stops, insurance, eSIM and activities — then "books" it into a trip with tickets and a checklist.

This version runs fully offline on built-in demo data (90 destinations including city breaks, New Year's Eve and surf trips, real interactive maps, a demo time machine with live travel days, Leeway Knots loyalty, Leeway Stars awards and printable tickets). Booking.com / Airbnb / flight APIs come later.

New in v8: Explore or Stay put trip styles; room upgrades (suites, apartments, beach and overwater villas); meal plans up to premium all-inclusive and resort add-ons; pay with knots (card, split or all knots); buy rewards and knot packs; five membership cards with qualifying trips and real checkout perks (stay discounts, richer knots).

## Publish on GitHub Pages
1. Create a new repository on GitHub (e.g. `leeway`) and upload everything in this folder.
2. Settings → Pages → Source: **Deploy from a branch**, Branch: **main**, Folder: **/docs** → Save.
3. Open `https://<your-username>.github.io/leeway/` on your phone and use **Add to Home Screen**. After the first visit it works offline.

## Develop
Source lives in `src/` (data, pricing engine, planner, illustrations, UI, styles). Rebuild the single-file app with `python3 build.py` → `docs/index.html`.
End-to-end test: `python3 test/e2e.py` (Playwright).

## Stories
Travellers write trip stories (route, nights, per-stop ratings, tips, highlights), and others rate, like, save, comment and copy the route into their own plan. On GitHub Pages stories, ratings and comments are stored on each device; the claude.ai-hosted version syncs them between signed-in viewers.

## Brand
The identity guide and logo files are in `docs/brand/` (open `docs/brand/index.html`). Regenerate them with `node brandgen.js`.

## Maps
Coastlines and borders come from Natural Earth (public domain), clipped per destination into `src/geo.js` so maps work offline. Rebuild with `npm i world-atlas@2.0.2 topojson-client@3.1.0` then `GEO_NM=./node_modules node geo/build-geo.js`.

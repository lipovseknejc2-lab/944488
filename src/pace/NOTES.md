# PACE

Gamified digital banking demo. One self-contained file, installable on a phone home screen.

- Live: https://lipovseknejc2-lab.github.io/944488/pace/
- Source: `src/pace/` (`store.js` data and rules, `mascot.js` Pip frames, `app.js` screens, `style.css`, `shell.html`)
- Build: `python3 src/pace/build.py` writes `dist/pace.html` and publishes `pace/` (index, manifest, service worker, icons)
- Tests: `node src/pace/tests/logic.test.js` (33 checks on money, points, cards, savings, mascot frames) and `node src/pace/tests/browser.js` (Chrome, phone, small phone, desktop, light and dark)
- Mascot assets: `node src/pace/tools/export.js` writes every frame as its own SVG plus contact sheets to `assets/mascot/`

## What is documented about BuckMe (GTA VI) and what is not
Documented in the sources found (gta.wiki, TweakTown, GTAbase, Rockstar preview coverage):
- BuckMe is the in-game phone banking app and holds the player's banked money.
- Money has three forms: cash on the person, an ATM card, and the BuckMe balance.
- Cash on the person can be lost; depositing at an ATM moves it into the BuckMe account.
- One video summary says the app cannot transfer money online and an ATM visit is needed.

Not found in any source, so not claimed: Family Savings, savings targets and levels, account limits, upgrades, the mascot.
Those come from the screenshot in the brief and from design choices made here. The screenshot was not attached to the
session, so PACE follows the written description of it (purple accent, white and grey surfaces, rounded account cards,
a small character beside the savings card), not the picture.

## Simulated environment
No real money, no real card or bank credentials. Money is integer cents in `store.js`, persisted in `localStorage`
(`pace.v1`). To go live, replace the functions on `Store` with calls to a regulated banking and payments provider.
Points are a separate balance and never mix with euros. Contact payments, own-account transfers, top-ups and savings
deposits never earn spending points, spending points are capped per day, and milestone bonuses are paid once.

## Mascot (Pip)
Every frame is a separate drawing built from a pose row: body geometry is redrawn, limbs are redrawn at new angles,
eyes and mouths are swapped for separately drawn shapes. Eye size, outline width and purple details never change.
Five stages have different artwork (proportions, crest, headband, tails, wings, medal). Ten animations, 770 frames.
Not drawn: side and back turnaround views, and the frames are vector, not hand-painted bitmaps.

---
name: publish-app
description: Build, test, publish and link an update to Atelier on GitHub Pages. Use at the end of every change to Atelier.
---

# Publish an Atelier update

1. **Test:** `bash src/atelier/tests/run.sh`. Every line must read 0 failed and no errors. Add checks for the new feature to `tests/feat.js` and `tests/phone.js` first.
2. **Look:** `node src/atelier/tests/look.js` (with the test server running), or take your own screenshots of the changed screens at iPhone size, light and dark. Compare them with `DESIGN.md`. Nothing may look plainer than before.
3. **Publish:** `cd src/atelier && python3 build.py && cp dist/atelier.html ../../atelier/index.html`, then raise `CACHE` in `atelier/sw.js` (for example `atelier-v1` to `atelier-v2`).
4. **Ship:** `git pull --rebase`, commit on `main` with a clear message, `git push`, then wait until `gh run list -L 1` shows the Pages deployment completed successfully.
5. **Reply** with a 2–4 line summary and the link https://lipovseknejc2-lab.github.io/944488/atelier/ , plus: "Open it once while online and it updates; if it doesn't, close it fully and reopen."

---
name: house-design
description: Atelier's house design (ink and glass, line icons, unfinished gesture characters, posters). Use for any visual change, new screen, icon, illustration or poster in Atelier.
---

# House design

1. Read `DESIGN.md` at the repository root. It holds the tokens, type, surfaces, icons, characters, motion and writing rules, plus the apps that keep their own art direction.
2. Open `src/atelier/art.js` and reuse what exists before drawing anything new: icons, FIG characters, avatars, posters and the clock.
3. New drawings follow these rules:
   - **Line:** one calm ink stroke with round caps, slight wobble and imperfect curves. Lines may overshoot, stop short or leave gaps.
   - **Colour:** cream on charcoal or ink on cream, with ONE accent used on one small element.
   - **People:** level 1 is a stick figure, level 2 a gesture contour (the default), level 3 a loose portrait. No detailed faces (a dot or dash at most), no shading, at least one unfinished line, anonymous and generic. Never real people or known characters.
   - **Posters:** one figure, a soft off-register wash, a short serif headline, a small uppercase caption and the mark, with a big calm margin.
   - **Icons:** 24 grid, stroke 1.7, single path, no fills.
   - **SVG:** `fill="none"`, round joins, cubic curves with uneven control points. Animate by drawing the line in with stroke-dashoffset.
4. Check your work: screenshot it on an iPhone-sized viewport, in light and dark where the app has both, and compare it with the screens next to it. Remove anything that is not needed. Never ship a screen that looks plainer than before.

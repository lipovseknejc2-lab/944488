# Atelier design guide

Atelier uses the house style below (light by default, with dark mode).

Read this before any visual change. The goal of every update is that the app looks **at least as good** and is **more** consistent afterwards. Copy existing components of the same app before inventing new ones.

## 1. House style

Calm, warm, hand-made: ink on paper behind frosted glass. Information first, colour carries meaning, lots of room.

### Colour
| Token | Light (default) | Dark |
|---|---|---|
| background | `#f6f3ee` | `#1b1a18` |
| surface 2 | `#ede8e0` | `#24221f` |
| card | `rgba(255,255,255,.74)` | `rgba(48,46,42,.66)` |
| text | `#22201c` | `#f2eee6` |
| secondary text | `#4a463f` | `#cdc7bd` |
| muted | `#857e73` | `#a29c91` |
| accent (clay) | `#d9764f` | `#e8875f` |

All tokens are CSS variables in `src/atelier/shell.html` (`:root` and `[data-theme=dark]`). Use the variables, never raw colours.

Meaning colours (light/dark): red `--red`, yellow `--yellow`, green `--green`, blue `--blue` (actions, links, your chat bubbles, ledger times), violet `--violet`.
- Status colours: to do = muted, doing = blue, done = green.
- In the focus timer: focus = clay, break = green, long break = blue.
- Use colour for information, never as decoration. Keep at most one accent per drawing.

### Type
- Page titles: **Newsreader** (serif) 400, 34–38px, tight leading.
- Everything else: **Instrument Sans**. Numbers are sans 650 with `tabular-nums`.
- Small labels: 11.5px uppercase, letter-spacing about .1em, muted.
- **Caveat** (handwriting) for "Today", greetings, sticky notes and phase labels. Use it sparingly.
- All fonts are embedded (latin and latin-ext, so č š ž work). Never load fonts from the network.

### Surfaces
- Cards: frosted glass (`backdrop-filter: blur(24px) saturate(160%)`), 20–22px radius, 1px hairline border, soft shadow, 16px padding.
- Navigation: a floating glass pill tab bar at the bottom on phones, which becomes a left sidebar at 900px and wider. The active tab has a sliding highlight.
- Sheets slide up from the bottom (28–30px top radius, grab handle). On wide screens they are centred dialogs.
- Buttons are pills. Primary = text colour background with background-coloured text. Secondary = card or fill.
- Minimum 44px tap targets, 16px side gutters, safe-area insets on iPhone.

### Line drawings, icons and characters
- Icons: a single stroke on a 24 grid, stroke 1.7, round caps and joins, slightly hand-drawn curves, no fills. Atelier's icon set lives in `src/atelier/art.js` (`ICON`). Add new icons there in the same style.
- Characters (`FIG` in `art.js`): gesture figures on a 100 grid. One ink colour plus **one** accent prop. Deliberately unfinished, with no faces (at most a dot), no shading, and at least one open line. Poses include think, write, walk, read, reach, rest, wave, duo and team.
- Avatars: a hair shape plus shoulders inside a tinted circle, with no face. Bots get a small bot badge.
- Posters: one figure, a soft off-register wash, a serif headline (two short lines at most), a small uppercase caption and the mark. Cream or charcoal background.
- Marks: Atelier is two lines meeting in a loop (`MARK_A`, `MARK_B` in `art.js`).
- Knots: in Atelier they measure usage like tokens and appear only on the You page. Always draw the same one-stroke knot. Never coins or bills. See `.claude/skills/knots-points`.

### Motion
- Splash: the mark draws itself (`stroke-dashoffset`, about 1.1s), then fades. No loading bar, ever.
- Page enter: children rise 12–14px with a stagger, about .5s, easing `cubic-bezier(.2,.9,.25,1)`.
- Charts grow or draw in, rings fill, numbers count up, press = scale .95.
- Always respect `prefers-reduced-motion`.

### Writing
No emojis. Short, warm, plain sentences. Empty states get a drawing, one serif line and one helpful sentence with a button.

## 2. Making updates better, not just different
- First look at the screen and its neighbours, then design the change in the same language: the same card, the same icon style, the same spacing.
- Every new feature gets an empty state, loading-free rendering, an animation consistent with the app, and works in light and dark where the app has both.
- Take screenshots before and after on an iPhone-sized viewport and compare them. If after looks plainer, less aligned or less finished, it is not done.
- Prefer adding to the existing design system (a new token or icon) over one-off styles.

## 3. Atelier specifics
- **Layout:** phone first. A floating glass tab bar (Today, Focus, Notes, Projects, Chat, You) becomes a left sidebar from 900px.
- **Today:**
  - a handwritten "Today" title with a drawn blue underline;
  - a week row of numbered day circles coloured by the main activity;
  - a message of the day card (blue play button);
  - a live focus card;
  - a handwritten greeting;
  - a ledger timeline with icon nodes and times in blue;
  - the floating quick panel (Note, Feeling, Action, Voice) with a tuck-away handle.
- **Focus clock:** hand-placed ticks, a thick arc in the phase colour, a knob, a big sans timer, and the drawn figure for the phase (write, rest, walk). The background glow follows the phase.
- **Notes:** cards with a colour top border and the note glyph (a folded page with a loop line).
- **Ideas:** sticky notes in Caveat, slightly rotated, with vote pills.
- **Chat:** your bubbles are blue, the others' are cards. Typing dots. Attachments show as cards.
- **Empty states:** a gesture figure that draws itself, a serif title, one sentence and one button.
- **Progress bars:** one shape everywhere (`.pbar`), 8px, track colour behind, the project or meaning colour in front, growing in from the left.
- **Shared cards in chat:** small uppercase label with a line icon, one bold line, then numbers in tabular sans; inside your blue bubbles they use white at low opacity.
- **Group and person info:** members as a horizontal strip of avatar tiles at the top, then active projects with progress, pinned, a three-column photo grid and a file list.
- **Agenda:** times in blue tabular sans on the left, a round check that fills green and draws its tick, the next item softly highlighted in blue. Buttons sit on the left so the quick panel never covers them.
- **Posters:** 8 in `POSTERS` (`art.js`), each one figure, one accent and a short headline. Add new ones in the same way.

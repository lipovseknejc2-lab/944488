# Atelier for Claude Code

Everything Claude Code needs to keep improving **Atelier** (the team-work app) without changing, simplifying or worsening the design:

- `CLAUDE.md`: the rules Claude Code follows automatically.
- `DESIGN.md`: Atelier's design guide (Claude-inspired ink and glass, line icons, drawn people, posters, motion).
- `.claude/skills/`: house-design, knots-points and publish-app.
- `src/atelier/`: the full source, fonts, build script, NOTES.md and the complete test suite (`tests/run.sh`). Rebuilding it reproduces the live app byte for byte.

## Prompt to paste into Claude Code
Open Claude Code with the repository lipovseknejc2-lab/944488, attach this zip, and paste:

> Unzip the attached file into the root of this repository, keeping every file exactly as it is: `CLAUDE.md`, `DESIGN.md`, `START-HERE.md`, `.gitignore`, `.claude/skills/` and `src/atelier/`. We only work on the Atelier app; do not touch the other apps in the repository.
> Check the setup: run `bash src/atelier/tests/run.sh` (install playwright with `npm i playwright` if needed). Every test must pass, and `git status` must show that `atelier/index.html` did not change. Then commit with the message "Add Atelier source, design guide and Claude Code rules" and push to main.
> From now on, follow `CLAUDE.md` and `DESIGN.md` for every change to Atelier: never simplify or remove features, never make the design worse, never rename saved-data keys, test everything on an iPhone-sized viewport, publish, and always end by giving me the live link https://lipovseknejc2-lab.github.io/944488/atelier/
> Reply with the repository link and the live link when you are done.

## Later updates
Just ask, for example "In Atelier, add a calendar to projects". Claude Code makes the change, runs all the tests, publishes it and gives you the link.

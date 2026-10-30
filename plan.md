# Plan: comment the JS and document it code-wise in the README

## Goal

Bring Pro Timer's JavaScript up to Caio's preferences (see `~/.claude/CLAUDE.md`):

- Every function, and every block or line that isn't obvious, gets a comment of **one line at most**. No multi-line comments or comment blocks anywhere.
- The README explains the code: every file, its main functions and how they work, how data flows and how the pieces connect.
- Caio said to apply the changes directly in this work (no step-by-step instructions needed).

## Already done (chat 1)

- CSS split into one file per folder; `main/style.css` only `@import`s them in cascade order. Verified in the browser: every element's computed style is identical to before, at desktop and phone width, with the pop-ups open.
- HTML split into one piece per part of the page; `index.html` is a skeleton of `<include src="…"></include>` tags, expanded by the `htmlIncludes` plugin in `vite.config.js` (dev and build). Dev reloads when a piece changes.
- Removed dead markup and CSS: the hidden `#avg-details` section, the empty `#timerins-Buttons` div (the timer is now centered, it sat 10px left), the unused `cubing/` importmap, `.footer-cube`, `.footer-value`, `.panel.cube`, `.setting-item`, the `.topbar button` typo selector (never matched; `.top-bar button` would change phone layout, so it wasn't "fixed").
- Fixed the settings panel nesting: the Layout section was inside the Color section. The 3 rows after Timer Options (phases, timer display, inspection start) stay outside `.timerOpt` on purpose, so they stay visible in untimed events (`event/eventLayout.js` hides `.timerOpt`).
- All new HTML, CSS and `vite.config.js` are commented. README has "The page (HTML)", "Styles (CSS)" and "Build config" sections.

## Rules for every part

- Comment style: `// One line.` above each function and each non-obvious block; short inline `//` for non-obvious lines. Match the file's existing tone.
- Rewrite existing comments that break the rules: emoji comments (`// 1️⃣ …`, `// 🔥 …`), multi-line `/* */` blocks, and banner comments like `// =====` + title + `// =====` (turn into one line).
- Delete commented-out code (e.g. `settings/settingsController.js` around line 140, `// const bgMain = …`).
- Keep the GPL license header at the top of `main/mainController.js`: it's a legal notice, not a code comment.
- Don't touch `cubisz/` (a copy of Caio's cubisz repo, changes belong there) or `public/cstimer_module.js` (csTimer's build). The README only describes what they offer to the app.
- Don't change behavior. If a bug turns up, write it down in the part's notes and tell Caio; don't fix it silently.
- README: add the part's folders under a `## Code` section (create it after "Folder layout" in part 1), one `### folder/` subsection each: what every file does, its main functions (name, inputs, what it returns or changes), and which other folders it talks to.
- At the end of each part: tick it off here, say which part is next.

## Parts

### Part 1: entry, settings, top bar, pop-ups (~1000 lines)

- [ ] `main/mainController.js` (28), `main/cstimer.js` (27): startup order; the worker message bridge (`call`, `callbacks`, `msgid`)
- [ ] `settings/settingsController.js` (330), `settings/settingsState.js`, `settings/layout.js` (31): `getThemeVar`, the color settings, `bindVisibilityToggle`, saved settings in localStorage
- [ ] `topbar/topbarController.js` (301), `topbar/topbarState.js`: category/event selects, penalty buttons, phone scramble button
- [ ] `modal/modalController.js` (216): details pop-up for solves, averages and the session
- [ ] README: create `## Code` with an intro (controller / state / helper file pattern), then `### main/`, `### settings/`, `### topbar/`, `### modal/`

### Part 2: timer, typed times, scrambles (~1280 lines)

- [ ] `timer/timerController.js` (350), `timer/timerState.js` (`PHASE`, `timerObj`), `timer/timer.js`, `timer/timerPhases.js` (`beginHold`), `timer/inspection.js`, `timer/timeFormatting.js`, `timer/countdownTimer.js` (76)
- [ ] `timeTyping/timeTypingController.js` (116)
- [ ] `scramble/scrambleController.js` (109), `scramble/scrData.js` (302), `scramble/scrHelpers.js` (71), `scramble/scrVisualiser.js` (38)
- [ ] README: `### timer/` (include the phases in `PHASE`: idle, inspecting, holding, ready, running, and what moves the timer from one to the next), `### timeTyping/`, `### scramble/`

### Part 3: averages and sessions (~1000 lines)

- [ ] `average/avgController.js` (119), `average/avgState.js`, `average/avgComput.js` (249, `computeAverage`, `averageOfN`, `penalty2`), `average/avgHelper.js` (64), `average/classicAvgs.js` (121)
- [ ] `session/sessionController.js` (256), `session/sessionState.js`, `session/solve.js` (160)
- [ ] README: `### average/` (block averages vs classic rolling averages), `### session/` (session object shape, what's saved in localStorage)

### Part 4: events and rendering (~820 lines)

- [ ] `event/eventController.js` (282: FMC submit, Multi-Blind pop-up, timer warnings), `event/eventLayout.js` (51), `event/FMC.js` (42), `event/MBLD.js` (98)
- [ ] `render/renderController.js` (84, `renderHistory`), `render/renderHelpers.js`, `render/renderHistoryList.js`, `render/renderAvgBuffer.js`, `render/renderBufferAvgStats.js`, `render/statistics.js`
- [ ] README: `### event/`, `### render/`

### Part 5: statistics page and the big picture (~880 lines)

- [ ] `stats/statsController.js` (509: filters, the 4 Chart.js charts, overview cards, averages table), `stats/statsHelpers.js` (368)
- [ ] README: `### stats/`, then `### How it fits together`: startup sequence, and the path of one solve (key press → timer phases → solve saved in the session → average updated → history, footer and sidebars redrawn → saved to localStorage)
- [ ] Final pass: grep for multi-line comments (`/\*` spanning lines) and emoji comments left anywhere outside `cubisz/` and `public/`
- [ ] Tick "Comment everything and document everything code-wise" in Notion (Pro Timer → Próximos passos → 🧹 Código)

## Next

Start **Part 1** in a new chat: "Read plan.md and do Part 1".

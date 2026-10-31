# Plan: export / import solves (and csTimer import)

## Goal

- **Export**: a button in Settings downloads every session as one `.json` file (a backup).
- **Import**: a button in Settings loads a file and adds its sessions next to the ones already there. It reads:
  - Pro Timer's own export file
  - csTimer's "Export to file" (`cstimer_YYYYMMDD_hhmmss.txt`, JSON inside)
- A select next to Import picks where the solves go:
  - **New sessions** (default): each session in the file is added; a name that's taken gets " (2)", " (3)"…
  - **Current session**: every solve in the file joins the session in use, grouped in its average mode by date; solves it already has (same `createdAt` and `time`) are skipped, so importing the same file twice adds nothing
- Importing never overwrites or deletes anything.

Notion task: "Add time exports/imports and enable csTimer time imports" (Pro Timer → Próximos passos → ✨ Funcionalidades). Tick it when Part 4 is done.

## Decisions

- UI goes in the Settings panel, as a new **Data** section after Layout (`settings/settingsPanel.html`). `settings/settings.css` already styles `.setting-control button`, so no new CSS.
- New folder `importExport/`, following the folder pattern (controller does the wiring, the other files only export functions):
  - `importExportController.js`: the buttons, reading the file, adding the sessions, switching to the first imported one
  - `exportSolves.js`: `buildExportFile`, `downloadJSON`, `exportFileName`
  - `importSolves.js`: `detectFormat`, `readProTimerFile`, `uniqueSessionName`, `buildSession`
  - `csTimerImport.js`: `readCsTimerFile`, `convertCsTimerSolve`, `csTimerPhases`
- Pro Timer file shape: `{ app: "Pro Timer", version: 1, exportedAt, sessions }`, where `sessions` is `sessionsObj.sessions` as is. Call `saveSessions()` first so the average in progress is in its session's `buffer`.
- csTimer sessions become **block** sessions in the event's WCA mode (`getDefaultModeForEvent`): solves oldest first, cut into blocks of `getNeededSolves(mode)`, the leftover solves go in the `buffer` (the average in progress).
- After an import: save, then `switchSession(firstImportedName)`, which fires `sessionChanged`, so the top bar loads it and redraws.
- localStorage is ~5 MB. `saveSessions()` throws a `QuotaExceededError` when it's full: catch it, remove the sessions just added, and tell the user.

## What I found

- Sessions: `sessionsObj.sessions` (`session/sessionState.js`), saved by `saveSessions()` (`session/sessionController.js`). A session is `{ averages, buffer: { mode, solveCounter, solvesArray }, classicStats?, category, scrambleType, mode }`. `averages` is newest first.
- `switchSession(name, skipSave)` in `sessionController.js` is **not exported yet**.
- `getDefaultModeForEvent(event)` in `topbar/topbarController.js` is **not exported yet**.
- The block-building code lives inside `averageOfN` (`average/avgController.js`, the `// The saved average, its numbers already formatted for display` part). Pull it out as `buildAverageBlock(solves, mode)` in `average/avgComput.js` so the import makes blocks the same way.
- The top bar needs `session.category` to be the category that holds `session.scrambleType`, or the event select ends up empty. Pro Timer's event codes are csTimer's scramble types (`scramble/scrData.js` is csTimer's list), so csTimer's `scrType` maps 1:1. A new helper `getCategoryOfEvent(code)` in `scramble/scrHelpers.js` finds the category (skip the `===…===` dividers).
- `solvePhases` is an array of strings made by `formatTime(ms)` (`timer/timeFormatting.js`), one per phase; a solve without phases has one entry.
- New buttons get the "blur on click" listener from `topbarController.js` automatically, since the settings HTML is in the page at load.

### csTimer's export file (from csTimer's `src/js/export.js` and `src/js/stats/stats.js`)

- Top-level keys `session1`, `session2`, … each hold that session's solves (an array, or the same array as a JSON string: handle both).
- `properties.sessionData` is a **JSON string**: `{ "1": { name, opt: { scrType }, rank, stat, date }, … }`. A session never renamed has its number as its name. `scrType` missing means `"333"`.
- One solve: `[[penalty, ms, …splits], scramble, comment, unixSeconds]`
  - penalty: `0` OK, `-1` DNF, `2000` +2 (milliseconds added)
  - `ms`: the raw time, without the penalty
  - splits for multi-phase: `[pen, total, end of phase n-1, …, end of phase 1]` (cumulative, reversed). Phase 1 = last element; phase j = `t[j] - t[j+1]`.
  - `unixSeconds × 1000` = Pro Timer's `createdAt`
- No inspection time is stored: use `0`, like typed times.
- Time: `Math.floor(ms / 10) / 100` (truncate to hundredths, like the timer).

## Parts

### Part 1: Data section and export
- [x] Data section in `settings/settingsPanel.html`: `#exportSolvesBtn`, `#importSolvesBtn`, hidden `<input type="file" id="importFileInput" accept=".json,.txt">`
- [x] `importExport/exportSolves.js`: `buildExportFile(sessions)`, `downloadJSON(obj, filename)`, `exportFileName()`
- [x] `importExport/importExportController.js`: Export button → `saveSessions()`, then download
- [x] Import the controller in `main/mainController.js`
- [x] Test: Export downloads `pro-timer_<date>.json` with every session

### Part 2: Import Pro Timer files
- [x] Export `switchSession` from `session/sessionController.js`
- [x] `importSolves.js`: `detectFormat(data)` → `"protimer"`, `"cstimer"` or `null`; `readProTimerFile(data)` → `[{ name, session }]` (reject `version` > 1); `uniqueSessionName(name, sessions)`
- [x] Controller: Import button opens the file picker; on `change`, `await file.text()`, reset `fileInput.value`, `JSON.parse` in try/catch, detect, confirm ("Import N sessions (M solves)?"), add with unique names, save in try/catch (quota), `switchSession` to the first one, alert a summary
- [x] Test: export, rename a session, import the file back: the sessions come back as "Name (2)"

### Part 2b: Import into the current session
- [x] `<select id="importTarget">` (New sessions / Current session) next to the Import button; the row has `.import-row` (`settings/settings.css`), which wraps the select and button under the long label
- [x] `buildAverageBlock(solves, mode)` in `average/avgComput.js`, re-exported by `avgController.js`; `averageOfN` uses it (optional: `penalty2` in `session/solve.js` too)
- [x] `session/solve.js`: `addSolvesToSession(solves, averageObj, getCurrentSession)`: skip solves the session has, merge the rest with the average in progress by date, cut whole blocks of the current mode into `session.averages`, sort the averages newest first; classic mode keeps them all in progress. Wrapper of the same name in `sessionController.js`
- [x] `importSolves.js`: `sessionSolves(session)` (every solve of a session); `countSolves` uses it
- [x] Controller: `addIntoCurrentSession(imported)`: confirm, back up `session.averages` and `averageObj.solvesArray`, add, recount classic, save in try/catch (restore the backup on a full storage), `renderHistory()`, `showLastSolve()`, alert how many were added and skipped
- [x] Test: import a file into its own session (nothing added), into an empty session, and into a classic session

### Part 3: Import csTimer files
- [x] `getCategoryOfEvent(code)` in `scramble/scrHelpers.js`, re-exported by `scrambleController.js` (other folders import the controller)
- [x] Export `getDefaultModeForEvent` from `topbar/topbarController.js`, and `formatTime` from `timer/timerController.js`
- [x] `importSolves.js`: `buildSession(solves, event, mode, category)` (sort by `createdAt`, blocks newest first, leftovers in `buffer`)
- [x] `csTimerImport.js`: `readCsTimerFile(data)` → `[{ name, event, solves }]`, `convertCsTimerSolve(record, event)`, `csTimerPhases(times)`
- [x] Decided: csTimer's `333fm` / `r3ni` sessions import as `"333"` (`CLOCK_TIME_ONLY`), since csTimer saves clock times there and Pro Timer would read them as moves / points
- [x] Controller: the `"cstimer"` branch builds each session with `buildSession` and goes through the same adding code as Part 2 (both targets: "Current session" regroups the solves anyway)
- [ ] Test with a real csTimer export (with a +2, a DNF and a multi-phase solve). A made-up csTimer file already passed: +2, DNF, 2-phase solves, a renamed session, an empty session left out, a session saved as JSON text

### Part 3b: Pick one session or all of them
- [x] `<dialog id="importDialog">` in the Data section (`settings/settingsPanel.html`), styled by `.import-dialog` in `settings/settings.css`: the file's sessions ("All sessions (N solves)" then each one; row hidden for a 1-session file), "Import into" (New sessions / Current session, moved here from the settings row), Cancel / Import
- [x] Controller: `askImport(imported)` opens it for every file with sessions and resolves with `{ chosen, target }` or `null` (Cancel / Escape); the file-picked handler awaits it, then adds into new sessions or the current one
- [x] Test: one session as new, one session into the current one, all into the current one, Cancel, Escape, a 1-session file (no dialog)
- Note: Chrome fires the dialog's `close` event on the next drawn frame, so in a hidden tab several scripted closes pile up; real clicks always get a frame in between

### Part 4: Docs and wrap-up
- [x] README: Features (Import / export), Folder layout (`importExport/`), the HTML pieces and CSS tables (Data section, import dialog), Startup, a `### importExport/` section (each file and function, the two file formats, `askImport`), `buildAverageBlock`, `addSolvesToSession`, `getCategoryOfEvent`, and the re-exports (`formatTime`, `getDefaultModeForEvent`, `switchSession`) in their sections
- [ ] Tick the Notion task

### Part 5: Other sources (WCA results, CubeDesk, Twisty Timer, csTimer CSV, lists of times)
Notion: "Add other timer/sources (eg. WCA comp results importing) imports", a sub-item of the task above.
- [x] `importSolves.js`: `detectTextFormat`, `parseCsv`, `msToSeconds`, `toHundredths`, `importedSolve`, `buildRoundsSession`; `detectFormat` knows CubeDesk
- [x] `wcaImport.js`: WCA API (`/persons/<id>/results` and `/competitions`, CORS works from localhost), one session per event, each full round its own average (`roundMode`), the other attempts grouped by date like `buildSession`
- [x] `cubeDeskImport.js` (new and old export), `twistyTimerImport.js` (backup), `textImport.js` (csTimer CSV, lists of times)
- [x] Controller: `sessionsFromFile(text, fileName)` with every format, `toSessions`, `sessionsFromWca`, `importSessions` (shared by files and WCA), `importWcaResults`; `askImport(imported, source)`
- [x] Settings: "Import WCA results" row (`#wcaIdInput`, `#wcaImportBtn`), hints under both import labels (`.setting-hint`), `.csv` in the picker
- [x] Tested: every reader on sample files; WCA with 2009ZEMD01 (all 2,492 full rounds match the official averages); WCA and CSV through the UI, into new and current sessions; re-importing skips everything; bad ID, unknown ID, unreadable file
- [x] README
- [x] WCIF (what "WCA comp results" meant: the competition JSON WCA Live uses): `wcifImport.js` `readWcifFile`, dates from the schedule (the competitor's group, else the round); a Competitor select in the import pop-up (`#importCompetitorRow`), remembered in localStorage; the controller passes choices `[{ label, source, imported }]` (one per competitor for WCIF, one for anything else). WCIF 1 (`result`) and 2 (`value`) both read. Tested on PuzzlingPakenhamSunday2026's public WCIF: all 328 full rounds match the official averages
- [x] Fixed the long FMC decimals in the stats sidebar (`formatStatValue` in `render/renderHelpers.js`)

### Optional later
- [ ] Export only the current session
- [ ] csTimer sessions never renamed are named "1", "2"…; number-like keys come first in a JS object, so they sit above every other session in the session select (maybe name them "csTimer 1")

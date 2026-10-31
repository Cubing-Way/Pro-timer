# Plan: WCA sync and "done at" on solves

## Goal

- **WCA sync**: Settings → Data's "Import WCA results" row becomes **WCA sync**. The WCA ID is remembered, and a **Sync** button fetches the competitor's results again and adds only the new ones to the "WCA <event>" sessions, creating the missing ones, with no pop-up. The one-time WCA import (and its pop-up) goes away; file imports keep the pop-up.
- **Auto sync**: when the app opens online with a saved WCA ID, it syncs quietly at most once a day, and the row shows "Last synced …".
- **"Done at"** (`doneAt`) on every new solve, where it was done:
  - Timed or typed in the app: the name typed in Settings → Data → "This device", else the device's model when the browser gives it ("Pixel 8", "iPhone"), else its type ("Computer", "Cellphone", "Tablet"). A browser can't read the device's IP or the computer's name.
  - WCA results and competition files (WCIF): the competition's short name ("Ligeirim Open 2025").
  - Other apps' files: the app's name ("csTimer", "CubeDesk", "Twisty Timer"). Lists of times get none. Pro Timer files keep what their solves have.
  - Old solves without it keep working; the solve details pop-up shows it when a solve has it.

Notion (Pro Timer → Próximos passos → ✨ Funcionalidades): "Sync WCA solves (importing WCA once feels useless)" and "Add a new attribute to solves: done at (eg. computer, cellphone IP or WCA comp, eg. Ligeirim)". Tick each when its part is done.

## Decisions (asked on 2026-10-31)

- The WCA row becomes the sync (no separate one-time import).
- Sync on load (online, at most once a day) plus the Sync button.
- Done at for the app's solves: typed name > model > device type.
- Other apps' files: the app's name.

## What I found

- The timer, typed times, FMC and Multi-Blind all save solves in one place: the `averageObj.solvesArray.push({ … })` in `averageOfN` (`average/avgController.js`). That's where `doneAt` goes.
- `importedSolve()` (`importExport/importSolves.js`) builds every imported solve except csTimer's file (`convertCsTimerSolve` builds its own object).
- The WCA API's `/persons/{id}/competitions` (already fetched by `fetchWcaPerson`) has `name` and `short_name` for each competition. It isn't paginated (219 competitions came back in one list for 2012PARK03), and every result's `competition_id` is in it (checked on 2009ZEMD01 and 2012PARK03).
- Dedupe: `solveKey` in `session/solve.js` is `createdAt|time`. WCA dates come from `attemptDate` (competition start date at 8:00 **local**, + event index × 20 min + round × 1 min + attempt × 1 s), so fetching again gives the same keys as long as the time zone and `WCA_EVENTS` / `ROUND_ORDER` don't change. `time` is `value / 100`, also the same every time. Checked: fetching 2012PARK03 twice gave the same 8,218 keys, none repeated.
  - Consequences: a WCA solve you delete comes back on the next sync. A result the WCA corrects later (a different time) is added as a new solve next to the old one.
  - The `?? today` fallback in `readWcaResults` (a competition missing from the list) would make a new date every day, so duplicates. It hasn't happened in the checks above.
- `addSolvesToSession(solves, averageObj, getCurrentSession)` only reads and writes `averageObj.mode`, `.solvesArray` and `.solveCounter`. A session's `buffer` is `{ mode, solveCounter, solvesArray }`, the same shape, so passing `session.buffer` and `() => session` makes it work on **any** session, not only the current one. For the current session, pass `averageObj` itself (its in-progress solves live there, `saveSessions()` copies them into the buffer).
- When saving fails (full storage), the last good state is still in `localStorage`, because sync calls `saveSessions()` before changing anything: put `sessionsObj.sessions` back from it and call `changedSession()`.
- Typing in an `<input>` doesn't start the timer (`isTyping` in `timer/timerController.js`).
- Other folders read settings state straight from `settings/settingsState.js` (like `timerSettObj`), so `avgController.js` can import a new `deviceSettObj` from there without a circular import.

## Parts

### Part 1: HTML, CSS and import plumbing (done by Claude, 2026-10-31)
- [x] `settings/settingsPanel.html`: "This device" row (`#deviceNameInput`) at the top of Data; the WCA row is now "WCA sync" with `#wcaSyncBtn` ("Sync") and a status line `#wcaSyncStatus`
- [x] `settings/settings.css`: `.device-name-input`
- [x] `importExport/importExportController.js`: `dataDOM.wcaImportBtn` renamed to `dataDOM.wcaSyncBtn` (the old import still runs from it until Part 3)
- [x] `importedSolve` takes `doneAt`; csTimer file and CSV → "csTimer", CubeDesk → "CubeDesk", Twisty Timer → "Twisty Timer", WCIF → the competition, WCA → the competition's `short_name` (`convertWcaAttempt` takes `doneAt`, `readWcaResults` maps competition ids to names)
- [x] README: the import tables and functions above

### Part 2: "done at" on the app's solves (Claude, at Caio's request; done 2026-10-31)
- [x] `settings/device.js`: `detectDeviceType()` (sync, from the user agent and touch points) and `detectDeviceModel()` (async: `navigator.userAgentData.getHighEntropyValues(["model"])` on Chrome for Android, "iPhone" / "iPad" from Safari's user agent, else null); `isIPad` helper shared by both
- [x] `settings/settingsState.js`: `deviceSettObj = { name, detected }` (`name` from `localStorage "deviceName"`)
- [x] `settings/settingsController.js`: fill `detected` (type, then the model when it comes), the box's value and placeholder, save the name on `change` (trimmed; an empty box removes the key)
- [x] `average/avgController.js`: `doneAt: deviceSettObj.name || deviceSettObj.detected` in `averageOfN`'s push
- [x] `modal/modalController.js`: a "Done at" line under "Date" in `solveRowHtml`, only when the solve has one
- [x] Test (in-app browser): a timed and a typed solve got "Computer"; a typed name ("  Caio's laptop  ", Enter) was trimmed, saved and used on the next solve, and survives a reload; clearing it goes back to "Computer"; the pop-up shows the line, and not on a solve without `doneAt`; export, then import as a new session, keeps each solve's `doneAt` (and the missing one stays missing); faked user agents give the right type and model (Android phone and tablet, Firefox Android, iPhone, iPad, Mac, Windows, a Chrome giving "Pixel 8", one that refuses). Not tried on a real phone
- [x] README: Features, Startup, the path of one solve, the solve table's `doneAt` row, the localStorage keys, `averageOfN`, `settingsController.js`, `deviceSettObj`, `device.js`, `solveRowHtml`
- [x] Found while testing, fixed at Caio's request: in Typing mode, a space typed in any text box (This device, the details pop-up's solution box) toggled the typed-time inspection count. The space listener under `// Typing mode: and so does the space bar` (`timer/timerController.js`) now skips it when `isTyping()`, except in `#typed-time`, which has the focus in Typing mode and keeps the shortcut. Tested: the device box leaves the timer alone, the typed-time box still starts and stops inspection, Timer mode is unchanged

### Part 3: WCA sync (Caio, guided; done 2026-10-31)
- [x] `session/solve.js`: `addRoundsToSession(rounds, averageObj, getSession)`: skip solves the session has; a round whose solves are all new and that has a mode becomes its own average (`buildAverageBlock`); the rest go through `addSolvesToSession`; sort the averages newest first; return how many were new
- [x] `session/sessionController.js`: wrapper `addRoundsToSession(name, rounds)` that passes `averageObj` for the current session (then recounts classic stats) and `session.buffer` for any other (a non-current classic session: delete its `classicStats`, so switching to it rebuilds them)
- [x] `importExportController.js`: `wcaSession(wcaId, event, name)` finds the session marked `wcaSync: { wcaId, event }`, else adopts one named exactly `name` with the same event and no mark (old imports), else returns null. The mark holds the ID too, so syncing a second competitor makes their own "WCA 3x3x3 (2)" sessions instead of mixing results
- [x] `importExportController.js`: `syncWca(quiet)` replaces `sessionsFromWca` and `importWcaResults`: read the ID (empty: forget it), fetch, `saveSessions()`, then per event add rounds to its session or create it (`buildRoundsSession`, `uniqueSessionName`, mark `wcaSync`), save (on a full storage, reload from localStorage and `changedSession()`), redraw (`renderSessionSelect`; when the current session got solves, `renderHistory`, and `showLastSolve` only while the timer is idle), remember the ID and `wcaLastSync`, write the status line ("Last synced … (<name>: N new solves)"); alerts only when not quiet. Helpers `showLastSync(note)` and `wcaSyncFailed(message, quiet)`
- [x] Startup: fill the box from `localStorage "wcaId"`, show the last sync, and `syncWca(true)` when there's an ID, `navigator.onLine`, and the last sync is over a day old
- [x] Remove what's no longer used (`sessionsFromWca`, `importWcaResults`)
- [x] Test (in-app browser, 2009ZEMD01): first sync made 17 sessions with 11,683 solves; a second sync added 0; deleting one solve of the current session's newest round, a non-current session's whole newest round, and two rounds of a classic session all came back as they were (the classic one lost its stale `classicStats`); a renamed session was filled; an unmarked "WCA Pyraminx" was adopted; a second ID (2016ALME03) got its own "(2)" sessions; a bad ID, an unknown ID and offline show alerts and keep the saved ID; an empty box forgets the ID; reload within a day doesn't fetch, over a day syncs quietly (a failure only shows in the status line); a full storage (simulated) puts everything back; a sync during a running solve doesn't write on the timer
- [x] README: the WCA section, the controller's functions, `addRoundsToSession` (both), the session shape's `wcaSync`, the localStorage keys, Startup, `showLastSolve`'s callers

### Part 3b: the import pop-up for WCA sync (Caio asked on 2026-10-31; done the same day)
- [x] `importSessions(choices, newLabel = "New sessions", addNew = addImportedSessions)` and `askImport(choices, newLabel)` (writes `dataDOM.newOption`'s text on every opening)
- [x] `syncWca` split: `syncIntoWcaSessions(wcaId, person, events, createMissing)` does the sync; the Sync button opens the pop-up ("<name>'s WCA profile", all events or one; "WCA sessions (new solves only)" or Current session, which is a plain `addIntoCurrentSession` import and doesn't save the ID or time); the daily sync stays quiet and only fills WCA sessions that already exist (`createMissing` off), so it respects the events picked in the pop-up
- [x] Test (in-app browser): pop-up contents, Cancel, one event, all events, daily sync with only 3x3 existing, Current session, a file import afterwards says "New sessions" again
- [x] README
- Testing note: while the Browser pane is hidden, a `<dialog>`'s `close` event waits for the next frame, so take a screenshot after closing it in tests

### Part 4: Wrap-up (done 2026-10-31)
- [x] Tick both Notion tasks ("Sync WCA solves" and "done at", both 2026-10-31)
- [x] Optional: sync also fills `doneAt` on WCA solves it skips. Not needed: Caio cleared his old WCA solves, so every WCA solve he has now came with `doneAt`

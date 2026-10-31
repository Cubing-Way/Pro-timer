import {
    sessionsObj,
    saveSessions,
    switchSession,
    getCurrentSession,
    renderSessionSelect,
    changedSession,
    addSolvesToSession,
    addRoundsToSession
} from "../session/sessionController.js";
import { averageObj, classicStats, updateClassicStats } from "../average/avgController.js";
import { renderHistory } from "../render/renderController.js";
import { showLastSolve } from "../timer/timerController.js";
import { PHASE, timerObj } from "../timer/timerState.js";
import { buildExportFile, downloadJSON, exportFileName } from "./exportSolves.js";
import {
    parseJSON,
    detectFormat,
    detectTextFormat,
    readProTimerFile,
    countSolves,
    sessionSolves,
    uniqueSessionName,
    buildSession,
    buildRoundsSession
} from "./importSolves.js";
import { readCsTimerFile } from "./csTimerImport.js";
import { readCubeDeskFile } from "./cubeDeskImport.js";
import { readTwistyTimerFile } from "./twistyTimerImport.js";
import { readCsTimerCsv, readTimeList } from "./textImport.js";
import { cleanWcaId, fetchWcaPerson, readWcaResults } from "./wcaImport.js";
import { readWcifFile } from "./wcifImport.js";
import { getDefaultModeForEvent } from "../topbar/topbarController.js";
import { getCategoryOfEvent } from "../scramble/scrambleController.js";

// The Data section's buttons in the settings panel, and the import pop-up
const dataDOM = {
    exportBtn: document.getElementById("exportSolvesBtn"),
    importBtn: document.getElementById("importSolvesBtn"),
    fileInput: document.getElementById("importFileInput"),
    wcaIdInput: document.getElementById("wcaIdInput"),                // the WCA ID to sync results from
    wcaSyncBtn: document.getElementById("wcaSyncBtn"),
    wcaSyncStatus: document.getElementById("wcaSyncStatus"),          // when it last synced, or what went wrong
    importDialog: document.getElementById("importDialog"),            // asks which sessions to import and where
    importInfo: document.getElementById("importInfo"),                // the line under the dialog's title
    competitorRow: document.getElementById("importCompetitorRow"),    // the competitors select and its label (competition files only)
    competitorSelect: document.getElementById("importCompetitorSelect"),
    sessionRow: document.getElementById("importSessionRow"),          // the sessions select and its label
    sessionSelect: document.getElementById("importSessionSelect"),    // All sessions, or one of them
    importTarget: document.getElementById("importTarget"),            // New sessions (WCA sessions for a WCA sync) or Current session
    newOption: document.querySelector('#importTarget option[value="new"]'),           // says what the non-current choice does
    currentOption: document.querySelector('#importTarget option[value="current"]')    // gets the session's name
};

// Export: put the average in progress in its session first, then download every session
dataDOM.exportBtn.addEventListener("click", () => {
    saveSessions();
    downloadJSON(buildExportFile(sessionsObj.sessions), exportFileName());
});

// Each app's sessions of loose solves ([{ name, event, solves }]) as Pro Timer sessions, each in its event's WCA average mode
function toSessions(looseSessions) {
    return looseSessions.map(({ name, event, solves }) => ({
        name,
        session: buildSession(solves, event, getDefaultModeForEvent(event), getCategoryOfEvent(event))
    }));
}

// Events made of competition rounds ([{ name, event, rounds }]) as Pro Timer sessions, where each full round is its own average
function toRoundSessions(events) {
    return events.map(({ name, event, rounds }) => ({
        name,
        session: buildRoundsSession(rounds, event, getDefaultModeForEvent(event), getCategoryOfEvent(event))
    }));
}

// A competition file's competitors as choices for the import pop-up ([{ label, source, imported }]), one per competitor with results
function competitorChoices(data) {
    return readWcifFile(data).map(({ name, wcaId, competition, events }) => ({
        label: wcaId ? `${name} (${wcaId})` : name,    // newcomers have no WCA ID yet
        source: `${name} at ${competition}`,           // "Caio Almeida at Campinas Open 2026 has 3 sessions…"
        imported: toRoundSessions(events)
    }));
}

// The file's sessions as [{ name, session }], whatever app made it (data is the parsed JSON, null for text files); throws an Error with a message for the user
function sessionsFromFile(text, data, fileName) {
    // JSON files are told apart by their keys, text files by their first line
    const format = detectFormat(data) ?? detectTextFormat(text);
    // Files with a single unnamed session (a CSV, a list of times) name it after the file, without the extension
    const name = fileName.replace(/\.[^.]+$/, "");

    if (format === "protimer") return readProTimerFile(data);
    if (format === "cstimer") return toSessions(readCsTimerFile(data));
    if (format === "cubedesk") return toSessions(readCubeDeskFile(data));
    if (format === "twistytimer") return toSessions(readTwistyTimerFile(text));
    if (format === "cstimercsv") return toSessions(readCsTimerCsv(text, name));

    // Anything else is read as a list of times; with no time in it, it's not a file Pro Timer knows
    const timeList = toSessions(readTimeList(text, name));
    if (timeList.length > 0) return timeList;
    throw new Error("Pro Timer can't read this file. It reads exports from Pro Timer, csTimer (file or CSV), CubeDesk and Twisty Timer, competition files (WCIF, from WCA Live), and lists of times.");
}

// Adds imported sessions under free names, saves, and switches to the first one
function addImportedSessions(imported) {
    // Ask first, saying how much is coming
    const solveCount = imported.reduce((sum, { session }) => sum + countSolves(session), 0);
    if (!confirm(`Import ${imported.length} session(s) with ${solveCount} solves?\nThey're added next to your sessions; nothing is replaced.`)) return;

    // Add each one under a name that isn't taken yet
    const addedNames = [];
    imported.forEach(({ name, session }) => {
        const freeName = uniqueSessionName(name, sessionsObj.sessions);
        sessionsObj.sessions[freeName] = session;
        addedNames.push(freeName);
    });

    // Saving throws when localStorage is full: take the new sessions back out, so nothing half-imported stays
    try {
        saveSessions();
    } catch {
        addedNames.forEach(name => delete sessionsObj.sessions[name]);
        alert("Not enough space in the browser's storage for these solves. Nothing was imported.");
        return;
    }

    // Show the first imported session (it also redraws the select, history and stats)
    switchSession(addedNames[0]);
    alert(`Imported: ${addedNames.join(", ")}`);
}

// Adds every solve of the file to the session in use, grouped in its average mode
function addIntoCurrentSession(imported) {
    // Every solve of the file, whichever session it was in
    const solves = imported.flatMap(({ session }) => sessionSolves(session));
    if (solves.length === 0) {
        alert("This file has no solves.");
        return;
    }

    // Ask first, saying where they go and how they're grouped
    const name = sessionsObj.currentSession;
    if (!confirm(`Add ${solves.length} solves to "${name}"?\nThey're grouped into ${averageObj.mode} averages by date; solves already in "${name}" are skipped.`)) return;

    // Copies of what adding changes, to put back if saving fails
    const session = getCurrentSession();
    const before = {
        averages: structuredClone(session.averages),
        inProgress: structuredClone(averageObj.solvesArray)
    };

    const added = addSolvesToSession(solves);
    // Classic mode recounts its rolling averages; the session keeps a copy of them (like after a penalty)
    if (averageObj.mode === "classic") updateClassicStats(true);
    session.classicStats = structuredClone(classicStats);

    // Saving throws when localStorage is full: put the session back as it was
    try {
        saveSessions();
    } catch {
        session.averages = before.averages;
        averageObj.solvesArray = before.inProgress;
        averageObj.solveCounter = before.inProgress.length;
        if (averageObj.mode === "classic") updateClassicStats(true);
        session.classicStats = structuredClone(classicStats);
        alert("Not enough space in the browser's storage for these solves. Nothing was imported.");
        return;
    }

    // Redraw the history and stats, and the timer in case the newest solve is an imported one
    renderHistory();
    showLastSolve();

    const skipped = solves.length - added;
    alert(`Added ${added} solves to "${name}".` + (skipped ? ` ${skipped} were already there.` : ""));
}

// localStorage key of the competitor picked last in a competition file (people mostly import their own results)
const LAST_COMPETITOR_KEY = "importCompetitor";

// Fills the pop-up's info line and sessions select with one choice's sessions; source names where they come from ("This file")
function showChoice({ source, imported }) {
    const total = imported.reduce((sum, { session }) => sum + countSolves(session), 0);
    const several = imported.length > 1;

    // What the source holds: how many sessions, or the name of its only one
    dataDOM.importInfo.textContent = several
        ? `${source} has ${imported.length} sessions with ${total} solves.`
        : `${source} has 1 session, "${imported[0].name}", with ${total} solves.`;

    // "All sessions" first, then each session with its solve count (the value is its index); only shown when there's a choice
    dataDOM.sessionRow.hidden = !several;
    dataDOM.sessionSelect.replaceChildren(
        new Option(`All sessions (${total} solves)`, "all"),
        ...imported.map(({ name, session }, i) => new Option(`${name} (${countSolves(session)} solves)`, i))
    );
}

// Asks whose results (competition files), which sessions and where; choices is [{ label, source, imported }]; resolves with { chosen, target }, or null when cancelled
function askImport(choices, newLabel) {
    // Start on the competitor picked last time, else the first (the only one, for any other file)
    const last = choices.findIndex(({ label }) => label === localStorage.getItem(LAST_COMPETITOR_KEY));
    let choice = choices[Math.max(0, last)];

    // Whose results: only asked when there are several competitors
    dataDOM.competitorRow.hidden = choices.length < 2;
    dataDOM.competitorSelect.replaceChildren(...choices.map(({ label }, i) => new Option(label, i)));
    dataDOM.competitorSelect.value = choices.indexOf(choice);
    // Another competitor shows their sessions (onchange, so each opening replaces the last one's handler instead of adding one)
    dataDOM.competitorSelect.onchange = () => {
        choice = choices[Number(dataDOM.competitorSelect.value)];
        showChoice(choice);
    };
    showChoice(choice);

    // Name the session in use, since that's where "Current session" puts the solves
    dataDOM.currentOption.textContent = `Current session ("${sessionsObj.currentSession}")`;
    // What the other choice does: new sessions for a file, the WCA sessions for a WCA sync
    dataDOM.newOption.textContent = newLabel;

    // Escape closes the dialog without a button, keeping the last returnValue, so clear it first
    dataDOM.importDialog.returnValue = "";
    dataDOM.importDialog.showModal();

    // Wait for Cancel, Import or Escape; the target select keeps its choice for the next import
    return new Promise(resolve => {
        dataDOM.importDialog.addEventListener("close", () => {
            if (dataDOM.importDialog.returnValue !== "import") return resolve(null);
            // Remember whose results were imported, for the next competition file
            if (choices.length > 1) localStorage.setItem(LAST_COMPETITOR_KEY, choice.label);
            const session = dataDOM.sessionSelect.value;
            resolve({
                chosen: session === "all" ? choice.imported : [choice.imported[Number(session)]],
                target: dataDOM.importTarget.value
            });
        }, { once: true });
    });
}

// Asks which sessions to import and where (import pop-up), then adds them; choices is [{ label, source, imported }]; newLabel names the non-current choice and addNew does it (a WCA sync passes its own)
async function importSessions(choices, newLabel = "New sessions", addNew = addImportedSessions) {
    // Nothing to import (a file with no sessions, a competition with no results yet, a competitor with no results Pro Timer has)
    if (choices.every(({ imported }) => imported.length === 0)) {
        alert(`${choices[0]?.source ?? "This file"} has no solves to import.`);
        return;
    }

    // Whose results, which sessions and where they go, picked in the import pop-up (null: cancelled)
    const answer = await askImport(choices, newLabel);
    if (!answer) return;
    // The session in use, or new sessions
    if (answer.target === "current") {
        addIntoCurrentSession(answer.chosen);
    } else {
        addNew(answer.chosen);
    }
}

// Import: the button opens the hidden file picker
dataDOM.importBtn.addEventListener("click", () => dataDOM.fileInput.click());

// A file was picked: read it, then add its sessions
dataDOM.fileInput.addEventListener("change", async () => {
    const file = dataDOM.fileInput.files[0];
    // Closing the picker without choosing picks nothing
    if (!file) return;

    const text = await file.text();
    // Empty the picker, so choosing the same file again still fires "change"
    dataDOM.fileInput.value = "";

    try {
        const data = parseJSON(text);
        // A competition file (WCIF) has every competitor, so the pop-up also asks whose results; any other file is one choice
        const choices = detectFormat(data) === "wcif"
            ? competitorChoices(data)
            : [{ label: null, source: "This file", imported: sessionsFromFile(text, data, file.name) }];
        await importSessions(choices);
    } catch (err) {
        alert(err.message);
    }
});

// localStorage keys: the WCA ID that syncs, and when it last synced (ms since 1970)
const WCA_ID_KEY = "wcaId";
const WCA_LAST_SYNC_KEY = "wcaLastSync";

// The name of the session WCA sync fills with a competitor's event: the one marked for them, else one from the old one-time import (same name and event, no mark), which gets marked; null when there's none
function wcaSession(wcaId, event, name) {
    const sessions = sessionsObj.sessions;

    // Marked by an earlier sync; the mark stays when the session is renamed
    const marked = Object.keys(sessions).find(key => sessions[key].wcaSync?.wcaId === wcaId && sessions[key].wcaSync.event === event);
    if (marked) return marked;

    // The import before sync made sessions with this name: adopt it, unless it's marked for another competitor
    const old = sessions[name];
    if (old && !old.wcaSync && old.scrambleType === event) {
        old.wcaSync = { wcaId, event };
        return name;
    }
    return null;
}

// Writes when it last synced in the status line ("Last synced 31 Oct 2026, 14:05"), plus a note about this sync; empty when it never synced
function showLastSync(note) {
    const last = Number(localStorage.getItem(WCA_LAST_SYNC_KEY));
    if (!last) {
        dataDOM.wcaSyncStatus.textContent = "";
        return;
    }
    // The date and time the way the browser's language writes them
    const when = new Date(last).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    dataDOM.wcaSyncStatus.textContent = note ? `Last synced ${when} (${note})` : `Last synced ${when}`;
}

// Shows why a sync failed in the status line, and in an alert too when Sync was pressed (not quiet)
function wcaSyncFailed(message, quiet) {
    dataDOM.wcaSyncStatus.textContent = message;
    if (!quiet) alert(message);
}

// Adds the events' new solves ([{ name, event, rounds }]) to the competitor's WCA sessions, creating the missing ones when createMissing, then saves, redraws and remembers the sync; throws on a full storage
function syncIntoWcaSessions(wcaId, person, events, createMissing) {
    // Put the average in progress in its session first: new solves may go there, and a full storage goes back to this
    saveSessions();

    // How many solves were new, and whether the session in use got some
    let added = 0;
    let currentChanged = false;
    events.forEach(({ name, event, rounds }) => {
        const sessionName = wcaSession(wcaId, event, name);
        if (sessionName) {
            // The event already has a session: only the solves it doesn't have yet
            const newSolves = addRoundsToSession(sessionName, rounds);
            added += newSolves;
            if (newSolves > 0 && sessionName === sessionsObj.currentSession) currentChanged = true;
        } else if (createMissing) {
            // No session for it yet: a new one under a free name, marked so later syncs find it
            const session = buildRoundsSession(rounds, event, getDefaultModeForEvent(event), getCategoryOfEvent(event));
            session.wcaSync = { wcaId, event };
            sessionsObj.sessions[uniqueSessionName(name, sessionsObj.sessions)] = session;
            added += countSolves(session);
        }
    });

    // Saving throws when localStorage is full: go back to the sessions saved just before
    try {
        saveSessions();
    } catch {
        sessionsObj.sessions = JSON.parse(localStorage.getItem("sessions"));
        changedSession();
        throw new Error("Not enough space in the browser's storage for these solves. Nothing was synced.");
    }

    // The select lists the new sessions; the session in use redraws its history, and the timer when no solve is going on
    renderSessionSelect();
    if (currentChanged) {
        renderHistory();
        if (timerObj.timerPhase === PHASE.IDLE) showLastSolve();
    }

    // Remember whose results and when, for the next sync; the name shows it's the right person
    localStorage.setItem(WCA_ID_KEY, wcaId);
    localStorage.setItem(WCA_LAST_SYNC_KEY, Date.now());
    showLastSync(`${person}: ${added} new solves`);
}

// Fetches the competitor's results, then adds the new ones: through the import pop-up from the Sync button, or quietly into the WCA sessions you already have (the daily sync on load)
async function syncWca(quiet = false) {
    // An empty box stops syncing: forget the ID and the last sync
    if (!dataDOM.wcaIdInput.value.trim()) {
        localStorage.removeItem(WCA_ID_KEY);
        localStorage.removeItem(WCA_LAST_SYNC_KEY);
        dataDOM.wcaSyncStatus.textContent = "";
        return;
    }

    // Something typed that isn't a WCA ID
    const wcaId = cleanWcaId(dataDOM.wcaIdInput.value);
    if (!wcaId) {
        wcaSyncFailed("Type a WCA ID, like 2009ZEMD01. It's on your profile at worldcubeassociation.org.", quiet);
        return;
    }
    // Show the ID cleaned up (capitals, no spaces)
    dataDOM.wcaIdInput.value = wcaId;

    // Show it's working, and block a second click until it's done
    dataDOM.wcaSyncBtn.disabled = true;
    dataDOM.wcaSyncStatus.textContent = "Syncing…";
    try {
        const { results, competitions } = await fetchWcaPerson(wcaId);
        // Every result has the competitor's name; someone with no results only has the ID
        const person = results[0]?.name ?? wcaId;
        const events = readWcaResults(results, competitions);

        // The daily sync: no pop-up, and only the sessions you already have, since the pop-up is where you pick which events get one
        if (quiet) {
            syncIntoWcaSessions(wcaId, person, events, false);
            return;
        }

        // Downloaded: the status line goes back to the last sync while the pop-up is open (and stays so on Cancel)
        showLastSync();

        // Each event as a session, so the pop-up can count its solves; its rounds stay for the sync
        const imported = events.map(({ name, event, rounds }) => ({
            name,
            event,
            rounds,
            session: buildRoundsSession(rounds, event, getDefaultModeForEvent(event), getCategoryOfEvent(event))
        }));

        // The import pop-up, like a file's: which events, and where (their WCA sessions, or the session in use)
        await importSessions(
            [{ label: null, source: `${person}'s WCA profile`, imported }],
            "WCA sessions (new solves only)",
            chosen => syncIntoWcaSessions(wcaId, person, chosen, true)
        );
    } catch (err) {
        wcaSyncFailed(err.message, quiet);
    } finally {
        dataDOM.wcaSyncBtn.disabled = false;
    }
}

// The Sync button, or Enter in the WCA ID box; the arrow keeps the click event out of syncWca's quiet
dataDOM.wcaSyncBtn.addEventListener("click", () => syncWca());
dataDOM.wcaIdInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") syncWca();
});

// Startup: the saved WCA ID and when it last synced
dataDOM.wcaIdInput.value = localStorage.getItem(WCA_ID_KEY) ?? "";
showLastSync();

// The daily sync: quiet, and only with a saved ID, online, and over a day after the last one (0 when it never synced)
const DAY = 24 * 60 * 60 * 1000;
const lastSync = Number(localStorage.getItem(WCA_LAST_SYNC_KEY));
if (dataDOM.wcaIdInput.value && navigator.onLine && Date.now() - lastSync > DAY) {
    syncWca(true);
}
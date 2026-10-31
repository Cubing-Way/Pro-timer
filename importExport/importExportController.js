import { sessionsObj, saveSessions, switchSession, getCurrentSession, addSolvesToSession } from "../session/sessionController.js";
import { averageObj, classicStats, updateClassicStats } from "../average/avgController.js";
import { renderHistory } from "../render/renderController.js";
import { showLastSolve } from "../timer/timerController.js";
import { buildExportFile, downloadJSON, exportFileName } from "./exportSolves.js";
import { 
    parseJSON, 
    detectFormat, 
    readProTimerFile, 
    countSolves, 
    sessionSolves, 
    uniqueSessionName,
    buildSession
} from "./importSolves.js";
import { readCsTimerFile } from "./csTimerImport.js";
import { getDefaultModeForEvent } from "../topbar/topbarController.js";
import { getCategoryOfEvent } from "../scramble/scrambleController.js";

// The Data section's buttons in the settings panel, and the import pop-up
const dataDOM = {
    exportBtn: document.getElementById("exportSolvesBtn"),
    importBtn: document.getElementById("importSolvesBtn"),
    fileInput: document.getElementById("importFileInput"),
    importDialog: document.getElementById("importDialog"),            // asks which sessions to import and where
    importInfo: document.getElementById("importInfo"),                // the line under the dialog's title
    sessionRow: document.getElementById("importSessionRow"),          // the sessions select and its label
    sessionSelect: document.getElementById("importSessionSelect"),    // All sessions, or one of them
    importTarget: document.getElementById("importTarget"),            // New sessions or Current session
    currentOption: document.querySelector('#importTarget option[value="current"]')    // gets the session's name
};

// Export: put the average in progress in its session first, then download every session
dataDOM.exportBtn.addEventListener("click", () => {
    saveSessions();
    downloadJSON(buildExportFile(sessionsObj.sessions), exportFileName());
});

// The file's sessions as [{ name, session }], whatever app made it; throws an Error with a message for the user
function sessionsFromFile(text) {
    const data = parseJSON(text);
    const format = detectFormat(data);

    if (format === "protimer") return readProTimerFile(data);
    
    // Each csTimer session becomes a Pro Timer session in its event's WCA average mode
    if (format === "cstimer") {
        return readCsTimerFile(data).map(({ name, event, solves }) => ({
            name,
            session: buildSession(solves, event, getDefaultModeForEvent(event), getCategoryOfEvent(event))
        }));
    }

    throw new Error("This file isn't a Pro Timer or csTimer export.");
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

// Asks which of the file's sessions to import and where; resolves with { chosen, target }, or null when cancelled
function askImport(imported) {
    const total = imported.reduce((sum, { session }) => sum + countSolves(session), 0);
    const several = imported.length > 1;

    // What the file holds: how many sessions, or the name of its only one
    dataDOM.importInfo.textContent = several
        ? `This file has ${imported.length} sessions with ${total} solves.`
        : `This file has 1 session, "${imported[0].name}", with ${total} solves.`;

    // "All sessions" first, then each session with its solve count (the value is its index); only shown when there's a choice
    dataDOM.sessionRow.hidden = !several;
    dataDOM.sessionSelect.replaceChildren(
        new Option(`All sessions (${total} solves)`, "all"),
        ...imported.map(({ name, session }, i) => new Option(`${name} (${countSolves(session)} solves)`, i))
    );

    // Name the session in use, since that's where "Current session" puts the solves
    dataDOM.currentOption.textContent = `Current session ("${sessionsObj.currentSession}")`;

    // Escape closes the dialog without a button, keeping the last returnValue, so clear it first
    dataDOM.importDialog.returnValue = "";
    dataDOM.importDialog.showModal();

    // Wait for Cancel, Import or Escape; the target select keeps its choice for the next import
    return new Promise(resolve => {
        dataDOM.importDialog.addEventListener("close", () => {
            if (dataDOM.importDialog.returnValue !== "import") return resolve(null);
            const choice = dataDOM.sessionSelect.value;
            resolve({
                chosen: choice === "all" ? imported : [imported[Number(choice)]],
                target: dataDOM.importTarget.value
            });
        }, { once: true });
    });
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
        const imported = sessionsFromFile(text);
        // A file with no sessions has nothing to import
        if (imported.length === 0) {
            alert("This file has no sessions.");
            return;
        }

        // Which sessions and where they go, picked in the import pop-up (null: cancelled)
        const answer = await askImport(imported);
        if (!answer) return;
        // The session in use, or new sessions
        if (answer.target === "current") {
            addIntoCurrentSession(answer.chosen);
        } else {
            addImportedSessions(answer.chosen);
        }
    } catch (err) {
        alert(err.message);
    }
});